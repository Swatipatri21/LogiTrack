import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, Table, TrackingBadge, Button, Spinner } from '../../ui';
import { historyAPI, hubAPI } from '../../../services/api';
import { downloadCSV } from '../../../utils/helpers';

const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function History() {
  const [allHistory, setAllHistory] = useState([]);
  const [history, setHistory] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterHub, setFilterHub] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    Promise.all([historyAPI.getAll(), hubAPI.getAll()])
      .then(([hRes, hubRes]) => {
        const data = hRes.data?.data || hRes.data || [];
        setAllHistory(data); setHistory(data);
        setHubs(hubRes.data?.data || hubRes.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleHubChange = async hubId => {
    setFilterHub(hubId); setFromDate(''); setToDate(''); setFetching(true);
    try {
      const r = hubId ? await historyAPI.getByHub(hubId) : await historyAPI.getAll();
      setHistory(r.data?.data || r.data || []);
    } catch { setHistory([]);
    setPage(1); }
    setFetching(false);
  };

  const applyDateRange = async () => {
    if (!fromDate || !toDate) return;
    setFetching(true);
    try {
      const r = await historyAPI.getByDateRange(`${fromDate}T00:00:00`, `${toDate}T23:59:59`);
      setHistory(r.data?.data || r.data || []);
    } catch { setHistory([]);
    setPage(1); }
    setFetching(false);
  };

  const clearFilters = async () => {
    setFromDate(''); setToDate(''); setSearch(''); setFilterAction(''); setFilterHub('');
    setFetching(true);
    try { const r = await historyAPI.getAll(); const d = r.data?.data || r.data || []; setAllHistory(d); setHistory(d); setPage(1);} catch {}
    setFetching(false);
  };

  const filtered = history.filter(h => {
    const q = search.toLowerCase();
    return (!q || (h.trackingId||'').toLowerCase().includes(q) || (h.action||'').toLowerCase().includes(q) || (h.performedBy||'').toLowerCase().includes(q))
      && (!filterAction || h.action === filterAction);
  });

  const uniqueActions = [...new Set(allHistory.map(h => h.action).filter(Boolean))];

  const exportCSV = () => downloadCSV([
    ['Tracking ID', 'Action', 'Performed By', 'Hub', 'Date', 'Details'],
    ...filtered.map(h => [h.trackingId||'', h.action||'', h.performedBy||'', h.hubName||'', fmtDate(h.timestamp), h.details||''])
  ], 'audit-history.csv');

  const exportPDF = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Audit History</title><style>body{font-family:system-ui;font-size:12px;padding:20px}h2{color:#065f46}table{width:100%;border-collapse:collapse}th{background:#065f46;color:#fff;padding:8px 10px;text-align:left;font-size:11px}td{padding:7px 10px;border-bottom:1px solid #d1fae5;font-size:11px;color:#374151}tr:nth-child(even) td{background:#f0fdf9}</style></head><body><h2>Audit History Report</h2><p>Generated: ${new Date().toLocaleDateString('en-IN')} · ${filtered.length} records</p><table><thead><tr><th>Tracking ID</th><th>Action</th><th>Performed By</th><th>Hub</th><th>Date</th><th>Details</th></tr></thead><tbody>${filtered.map(h=>`<tr><td>${h.trackingId||'—'}</td><td>${(h.action||'').replace(/_/g,' ')}</td><td>${h.performedBy||'—'}</td><td>${h.hubName||'—'}</td><td>${fmtDate(h.timestamp)}</td><td>${h.details||'—'}</td></tr>`).join('')}</tbody></table></body></html>`);
    win.document.close(); win.print();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><Spinner size={32} color="#10b981" /></div>;

  const inputStyle = { padding: '7px 11px', border: '1px solid #d1fae5', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f0fdf9', color: '#065f46' };
  // Add this just before the return statement
const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <SectionHeader title="Audit History" subtitle="All system actions and status changes"
        action={<div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={exportCSV}>⬇ CSV</Button>
          <Button variant="ghost" onClick={exportPDF}>⬇ PDF</Button>
        </div>} />
      <Card>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #ecfdf5', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tracking ID, action, user..." style={{ ...inputStyle, flex: 2, minWidth: 180 }} />
          <select value={filterHub} onChange={e => handleHubChange(e.target.value)} style={inputStyle}>
            <option value="">All Hubs</option>
            {hubs.map(h => <option key={h.id} value={h.id}>{h.name || `Hub ${h.id}`}</option>)}
          </select>
          <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">All Actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
          <span style={{ fontSize: 12, color: '#4b7063' }}>to</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
          <Button variant="primary" size="sm" onClick={applyDateRange} disabled={!fromDate || !toDate || fetching}>{fetching ? '...' : 'Apply'}</Button>
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
          <span style={{ fontSize: 12, color: '#4b7063', marginLeft: 'auto' }}>{fetching ? 'Loading...' : `${filtered.length} records`}</span>
        </div>
        <Table
          columns={[
            { label: 'Tracking ID',  render: h => h.trackingId ? <TrackingBadge id={h.trackingId} /> : <span style={{ color: '#4b7063' }}>—</span> },
            { label: 'Action',       render: h => <span style={{ fontSize: 12, fontWeight: 700, color: '#1e4035' }}>{(h.action||'').replace(/_/g,' ')}</span> },
            { label: 'Performed By', render: h => <span style={{ fontSize: 12 }}>{h.performedBy||'—'}</span> },
            { label: 'Hub',          render: h => <span style={{ fontSize: 12, color: '#4b7063' }}>{h.hubName||'—'}</span> },
            { label: 'Details',      render: h => <span style={{ fontSize: 12, color: '#4b7063' }}>{h.details||'—'}</span> },
            { label: 'Date',         render: h => <span style={{ fontSize: 11.5, color: '#4b7063' }}>{fmtDate(h.timestamp)}</span> },
          ]}
          rows={paginated} emptyText="No history records found" />
          {totalPages > 1 && (
  <div style={{ padding: '12px 16px', borderTop: '1px solid #ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
    <span style={{ fontSize: 12, color: '#4b7063' }}>
      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
    </span>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <Button variant="ghost" size="xs" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, i, arr) => {
          if (i > 0 && arr[i - 1] !== p - 1) acc.push('...');
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) => p === '...'
          ? <span key={`ellipsis-${i}`} style={{ fontSize: 12, color: '#4b7063', padding: '0 4px' }}>…</span>
          : <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${page === p ? '#10b981' : '#d1fae5'}`, background: page === p ? '#ecfdf5' : '#fff', color: page === p ? '#065f46' : '#4b7063', fontSize: 12, fontWeight: page === p ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
        )}
      <Button variant="ghost" size="xs" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</Button>
    </div>
  </div>
)}
      </Card>
    </div>
  );
}
