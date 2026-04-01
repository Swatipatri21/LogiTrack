import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, TrackingBadge, Button, Spinner } from '../../ui';
import { historyAPI } from '../../../services/api';
import { fmt, downloadCSV } from '../../../utils/helpers';

export default function HubHistory({ user }) {
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate]         = useState('');
  const [toDate, setToDate]             = useState('');
  const [dateLoading, setDateLoading]   = useState(false);

  const loadHistory = useCallback(async (from = null, to = null) => {
    if (!user?.hubId) {
      console.warn('No hubId provided for user');
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      let response;

      if (from && to) {
        // Hub-scoped date range — server filters by both hubId AND date range
     response = await historyAPI.getByHub(user.hubId);
        response = await historyAPI.getByHubAndDateRange(
          user.hubId,
          from,
          toDate
        );
      } else {
        // All history for this hub
        response = await historyAPI.getByHub(user.hubId);
      }

      // Normalise response structure
      let records = [];
      if (response.data?.data) {
        records = response.data.data;
      } else if (Array.isArray(response.data)) {
        records = response.data;
      } else if (response.data) {
        records = [response.data];
      }

      // No client-side hub filtering needed — server guarantees hub scope
      console.log(`Fetched ${records.length} records for hub ${user.hubId}`);
      setHistory(records);

    } catch (err) {
      console.error('Failed to load history:', err);

      if (err.response?.status === 403) {
        setError('You don\'t have permission to view history. Please contact your administrator.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.response?.status === 404) {
        setError('History data not found. Please check your configuration.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timeout. Please check your connection and try again.');
      } else if (err.message?.includes('Network Error')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to load history. Please try again later.');
      }

      setHistory([]);
    } finally {
      setLoading(false);
      setDateLoading(false);
    }
  }, [user?.hubId]);

  useEffect(() => {
    if (user?.hubId) {
      setLoading(true);
      loadHistory();
    } else if (user && !user.hubId) {
      setLoading(false);
      setError('User hub information not available. Please contact support.');
    } else {
      setLoading(false);
      setError('User information not available.');
    }
  }, [user?.hubId, loadHistory]);

  const applyDateRange = async () => {
    if (!fromDate || !toDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    setError(null); // clear any previous error before fetching
    setDateLoading(true);
    await loadHistory(fromDate, toDate);
  };

  const clearFilters = async () => {
    setFromDate('');
    setToDate('');
    setSearch('');
    setFilterStatus('');
    setDateLoading(true);
    await loadHistory();
  };

  // Client-side search + action filter (operates on already hub-scoped data)
  const uniqueActions = [...new Set(history.map(h => h.action).filter(Boolean))];

  const filtered = history
    .filter(h => {
      const term = search.toLowerCase().trim();
      if (!term) return true;
      return (
        h.trackingId?.toLowerCase().includes(term) ||
        h.action?.toLowerCase().includes(term) ||
        h.performedBy?.toLowerCase().includes(term) ||
        h.details?.toLowerCase().includes(term)
      );
    })
    .filter(h => !filterStatus || h.action === filterStatus);

  const exportCSV = () => {
    try {
      if (filtered.length === 0) { setError('No data to export.'); return; }
      const csvData = [
        ['Tracking ID', 'Action', 'Performed By', 'Timestamp', 'Details'],
        ...filtered.map(h => [
          h.trackingId || '',
          h.action || '',
          h.performedBy || '',
          h.timestamp || '',
          (h.details || '').replace(/,/g, ';'),
        ])
      ];
      const fileName = `hub-history-${user.hubName || user.hubId || 'hub'}-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvData, fileName);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setError('Failed to export CSV. Please try again.');
    }
  };

  const exportPDF = () => {
    try {
      if (filtered.length === 0) { setError('No data to export.'); return; }
      const win = window.open('', '_blank');
      if (!win) { setError('Popup blocked. Please allow popups for this site.'); return; }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hub History Report - ${user.hubName || user.hubId}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; font-size: 12px; padding: 30px; background: #fff; }
            .header { margin-bottom: 30px; text-align: center; }
            h1 { color: #065f46; font-size: 24px; margin-bottom: 8px; }
            .report-meta { color: #6b7280; font-size: 11px; margin-top: 10px; }
            .report-meta div { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th { background: #065f46; color: #fff; padding: 12px 8px; text-align: left; font-weight: 600; font-size: 12px; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
            tr:hover { background: #f9fafb; }
            .tracking-id { font-family: 'Courier New', monospace; font-weight: 600; color: #065f46; }
            .action-badge { display: inline-block; padding: 2px 8px; background: #f3f4f6; border-radius: 4px; font-size: 11px; font-weight: 500; }
            .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
              tr { page-break-inside: avoid; }
              th { background: #065f46 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #065f46; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">🖨️ Print / Save as PDF</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">Close</button>
          </div>
          <div class="header">
            <h1>📋 Hub History Report</h1>
            <div class="report-meta">
              <div><strong>Hub:</strong> ${user.hubName || user.hubId || 'N/A'}</div>
              <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Total Records:</strong> ${filtered.length}</div>
              ${fromDate && toDate ? `<div><strong>Date Range:</strong> ${fromDate} to ${toDate}</div>` : ''}
              ${search ? `<div><strong>Search Term:</strong> "${search}"</div>` : ''}
              ${filterStatus ? `<div><strong>Action Filter:</strong> ${filterStatus.replace(/_/g, ' ')}</div>` : ''}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tracking ID</th><th>Action</th><th>Performed By</th><th>Time</th><th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(h => `
                <tr>
                  <td class="tracking-id">${h.trackingId || '—'}</td>
                  <td><span class="action-badge">${(h.action || '').replace(/_/g, ' ')}</span></td>
                  <td>${h.performedBy || '—'}</td>
                  <td>${fmt(h.timestamp) || '—'}</td>
                  <td style="max-width: 300px;">${(h.details || '—').substring(0, 100)}${h.details?.length > 100 ? '...' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${filtered.length === 0 ? '<p style="text-align:center;color:#9ca3af;margin-top:40px;">No records found</p>' : ''}
          <div class="footer"><p>Generated by Hub Management System • ${new Date().toLocaleDateString()}</p></div>
        </body>
        </html>
      `;
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setError('Failed to export PDF. Please try again.');
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #d1fae5',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#f0fdf9',
    color: '#065f46',
    transition: 'all 0.2s',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Spinner size={40} color="#10b981" />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading history data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#dc2626' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Error Loading History</div>
            <div style={{ fontSize: '14px', color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>{error}</div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setError(null); setLoading(true); loadHistory(); }}
              style={{ marginTop: '20px' }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46, #047857)',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        color: '#fff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: '48px' }}>📋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            {user.hubName || user.hubId || 'My Hub'} — Activity History
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
            Complete shipment activity log for your hub
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="ghost"
            onClick={exportCSV}
            disabled={filtered.length === 0}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              padding: '8px 16px',
            }}
          >
            📊 Export CSV
          </Button>
          <Button
            variant="ghost"
            onClick={exportPDF}
            disabled={filtered.length === 0}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              padding: '8px 16px',
            }}
          >
            📄 Export PDF
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        {/* Filters */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #ecfdf5',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: '#ffffff',
        }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by tracking ID, action, user..."
            style={{ ...inputStyle, flex: 2, minWidth: '220px' }}
          />

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, minWidth: '140px' }}
          >
            <option value="">All Actions</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ ...inputStyle, width: '140px' }}
          />

          <span style={{ fontSize: '13px', color: '#4b7063', fontWeight: '500' }}>→</span>

          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ ...inputStyle, width: '140px' }}
          />

          <Button
            variant="primary"
            size="sm"
            onClick={applyDateRange}
            disabled={!fromDate || !toDate || dateLoading}
          >
            {dateLoading ? 'Applying...' : 'Apply Date Range'}
          </Button>

          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All Filters
          </Button>

          <span style={{
            fontSize: '13px',
            color: '#4b7063',
            marginLeft: 'auto',
            fontWeight: '500',
            background: '#ecfdf5',
            padding: '6px 14px',
            borderRadius: '20px',
          }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <Table
            columns={[
              {
                label: 'Tracking ID',
                render: h => h.trackingId
                  ? <TrackingBadge id={h.trackingId} />
                  : <span style={{ color: '#9ca3af', fontSize: '13px' }}>—</span>,
              },
              {
                label: 'Action',
                render: h => (
                  <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
                    {(h.action || '').replace(/_/g, ' ')}
                  </span>
                ),
              },
              {
                label: 'Performed By',
                render: h => <span style={{ fontSize: '13px', color: '#374151' }}>{h.performedBy || '—'}</span>,
              },
              {
                label: 'Details',
                render: h => <span style={{ fontSize: '12px', color: '#6b7280' }}>{h.details || '—'}</span>,
              },
              {
                label: 'Timestamp',
                render: h => (
                  <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {fmt(h.timestamp) || '—'}
                  </span>
                ),
              },
            ]}
            rows={filtered}
            emptyText="No history records found for your hub"
          />
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Records Found</div>
            <div style={{ fontSize: '14px' }}>
              {search || filterStatus || fromDate
                ? 'No matching records found. Try adjusting your filters.'
                : 'No history records available for your hub yet.'}
            </div>
            {(search || filterStatus || fromDate) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} style={{ marginTop: '20px' }}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}