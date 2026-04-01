import React, { useMemo, useState } from 'react';
import { SectionHeader, Card, CardHeader, Table, Button, StatusBadge, TrackingBadge, StatCard } from '../../ui';
import { downloadCSV } from '../../../utils/helpers';

export default function SLAReports({ shipments = [] }) {
  const [threshold, setThreshold] = useState(90);

  const stats = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter(s => s.currentStatus === 'DELIVERED').length;
    const delayed = shipments.filter(s => s.isDelayed || s.currentStatus === 'DELAYED').length;
    const onTimeRate = total ? Math.round(((delivered-delayed)/total)*100) : 0;
    const breaching = onTimeRate < threshold;
    return { total, delivered, delayed, onTimeRate, breaching };
  }, [shipments, threshold]);

  const breachList = useMemo(() => shipments.filter(s => s.isDelayed), [shipments]);

  const exportPDF = () => {
    const win = window.open('','_blank');
    win.document.write(`<html><head><title>SLA Report</title><style>body{font-family:system-ui;font-size:12px;padding:20px}h2{color:#065f46}table{width:100%;border-collapse:collapse}th{background:#065f46;color:#fff;padding:8px;text-align:left}td{padding:7px;border-bottom:1px solid #d1fae5}</style></head><body><h2>SLA Report — ${new Date().toLocaleDateString()}</h2><p>On-Time Rate: <strong>${stats.onTimeRate}%</strong> | Threshold: ${threshold}% | ${stats.breaching?'⚠ BREACH':'✓ Within SLA'}</p><table><thead><tr><th>Tracking ID</th><th>Status</th><th>Sender</th><th>Destination</th></tr></thead><tbody>${breachList.map(s=>`<tr><td>${s.trackingId||'—'}</td><td>${s.currentStatus||'—'}</td><td>${s.senderName||'—'}</td><td>${s.destination||'—'}</td></tr>`).join('')}</tbody></table></body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div>
      <SectionHeader title="SLA Reports" subtitle="On-time delivery percentage and breach monitoring"
        action={<Button variant="ghost" onClick={exportPDF}>📄 Export PDF</Button>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard icon="📊" label="On-Time Rate" value={`${stats.onTimeRate}%`} color={stats.onTimeRate>=threshold?'#10b981':'#ef4444'} />
        <StatCard icon="✅" label="Delivered" value={stats.delivered} color="#059669" />
        <StatCard icon="⚠️" label="Delayed" value={stats.delayed} color="#f59e0b" />
        <StatCard icon="🎯" label="SLA Target" value={`${threshold}%`} color="#0d9488" />
      </div>

      {stats.breaching && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:16, marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:24 }}>🚨</span>
          <div>
            <div style={{ fontWeight:800, color:'#b91c1c', fontSize:14 }}>SLA Breach Alert</div>
            <div style={{ fontSize:13, color:'#991b1b' }}>Current on-time rate ({stats.onTimeRate}%) is below threshold ({threshold}%). Immediate action required.</div>
          </div>
        </div>
      )}

      <Card style={{ marginBottom:20 }}>
        <CardHeader title="SLA Threshold" subtitle="Adjust the minimum acceptable on-time delivery percentage" />
        <div style={{ padding:20, display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#065f46', minWidth:120 }}>Threshold: {threshold}%</span>
          <input type="range" min={50} max={100} value={threshold} onChange={e=>setThreshold(Number(e.target.value))}
            style={{ flex:1, accentColor:'#10b981', cursor:'pointer' }} />
          <div style={{ padding:'4px 14px', borderRadius:20, background: stats.onTimeRate>=threshold?'#ecfdf5':'#fef2f2', color:stats.onTimeRate>=threshold?'#065f46':'#b91c1c', fontSize:12, fontWeight:800, border:`1px solid ${stats.onTimeRate>=threshold?'#a7f3d0':'#fecaca'}` }}>
            {stats.breaching ? '⚠ BREACH' : '✓ COMPLIANT'}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Delayed Shipments" subtitle={`${breachList.length} shipments flagged as delayed`} />
        <Table columns={[
          { label:'Tracking ID', render:s=><TrackingBadge id={s.trackingId} /> },
          { label:'Sender', render:s=><span style={{ fontWeight:600 }}>{s.senderName||'—'}</span> },
          { label:'Route', render:s=><span style={{ fontSize:12, color:'#4b7063' }}>{s.origin} → {s.destination}</span> },
          { label:'Status', render:s=><StatusBadge status={s.currentStatus} /> },
        ]} rows={breachList} emptyText="No delayed shipments — SLA is healthy!" />
      </Card>
    </div>
  );
}
