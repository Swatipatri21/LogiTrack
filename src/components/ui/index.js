import React, { useEffect, useMemo,useId, useRef } from 'react';

// ── helpers ────────────────────────────────────────────────
function formatStatus(s) { return String(s||'').toUpperCase().replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase()); }
function getStatusTheme(s) {
  const v = String(s||'').toUpperCase();
  if (v.includes('DELIVERED')) return 'success';
  if (v.includes('FAILED')||v.includes('REJECTED')||v.includes('RETURNED')) return 'danger';
  if (v.includes('DELAYED')||v.includes('ATTEMPTED')) return 'warning';
  if (v.includes('IN_TRANSIT')||v.includes('OUT_FOR_DELIVERY')||v.includes('DISPATCHED')||v.includes('ARRIVED')) return 'info';
  return 'primary';
}
function getRoleTheme(r) {
  const v = String(r||'').toUpperCase();
  if (v==='ADMIN') return 'primary';
  if (v==='HUB_MANAGER') return 'info';
  return 'success';
}

// ── Exports ────────────────────────────────────────────────
export function RoleBadge({ role }) {
  const theme = getRoleTheme(role);
  return <span className={`lt-badge lt-badge--${theme}`}>{role ? String(role).replace(/_/g,' ') : '—'}</span>;
}

export function TrackingBadge({ id, size='md' }) {
  const style = size==='lg' ? { fontSize:13, padding:'5px 12px' } : size==='sm' ? { fontSize:11, padding:'2px 8px' } : undefined;
  return <span className="lt-badge lt-badge--primary" style={style}>{id ? String(id).toUpperCase() : '—'}</span>;
}

export function StatusBadge({ status, size='md' }) {
  const theme = getStatusTheme(status);
  const style = size==='lg' ? { fontSize:13, padding:'5px 12px' } : size==='sm' ? { fontSize:11, padding:'2px 8px' } : undefined;
  return <span className={`lt-badge lt-badge--${theme}`} style={style}>{status ? formatStatus(status) : '—'}</span>;
}

export function Alert({ message, type='info' }) {
  const t = String(type||'info').toLowerCase();
  const icon = t==='danger'?'⚠':t==='success'?'✓':t==='warning'?'⚡':'ℹ';
  return (
    <div className={`lt-alert lt-alert--${t==='error'?'danger':t}`}>
      <span>{icon}</span><span>{message||''}</span>
    </div>
  );
}

export function Spinner({ size=24, color='var(--color-primary)' }) {
  return <div className="lt-spinner" style={{ '--s':`${size}px`, '--c':color }} />;
}

export function Button({ variant='primary', size='md', children, style, className, ...rest }) {
  const v = String(variant||'primary');
  const s = String(size||'md');
  const sClass = s==='xs'?'lt-btn--xs':s==='sm'?'lt-btn--sm':s==='lg'?'lt-btn--lg':'lt-btn--md';
  const vClass = {ghost:'lt-btn--ghost',danger:'lt-btn--danger',warning:'lt-btn--warning',success:'lt-btn--success',info:'lt-btn--info',blue:'lt-btn--blue'}[v]||'lt-btn--primary';
  return <button className={`lt-btn ${sClass} ${vClass} ${className||''}`.trim()} style={style} {...rest}>{children}</button>;
}

export function Card({ children, style, className }) {
  return <div className={`lt-card ${className||''}`.trim()} style={style}>{children}</div>;
}
export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="lt-card-header">
      <div>{title && <div className="lt-card-title">{title}</div>}{subtitle && <div className="lt-card-subtitle">{subtitle}</div>}</div>
      {action && <div>{action}</div>}
    </div>
  );
}
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="lt-section-header">
      <div>{title && <div className="lt-section-title">{title}</div>}{subtitle && <div className="lt-section-subtitle">{subtitle}</div>}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ icon, label, value, color='var(--color-primary)', trend, onClick }) {
  return (
    <div className="lt-card" style={{ padding:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, cursor:onClick?'pointer':'default', transition:'transform .15s, box-shadow .15s' }}
      onClick={onClick} onMouseEnter={e=>onClick&&(e.currentTarget.style.transform='translateY(-2px)')} onMouseLeave={e=>onClick&&(e.currentTarget.style.transform='')}>
      <div>
        <div style={{ fontSize:28, fontWeight:900, color, letterSpacing:'-1px' }}>{value??0}</div>
        <div style={{ fontSize:11.5, color:'var(--color-muted)', fontWeight:700, marginTop:3, textTransform:'uppercase', letterSpacing:'.5px' }}>{label}</div>
        {trend && <div style={{ fontSize:11.5, color:'var(--color-muted)', fontWeight:600, marginTop:6 }}>{trend}</div>}
      </div>
      <div style={{ width:46, height:46, borderRadius:13, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color, flexShrink:0 }}>{icon}</div>
    </div>
  );
}

export function Table({ columns=[], rows=[], emptyText='No records found' }) {
  if (!rows || rows.length === 0) return (
    <div style={{ padding:'32px 14px', textAlign:'center', color:'var(--color-muted)', fontWeight:700, fontSize:13 }}>{emptyText}</div>
  );
  return (
    <div style={{ width:'100%', overflowX:'auto' }}>
      <table className="lt-table">
        <thead><tr>{columns.map((c,i)=><th key={i}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((r,ri)=><tr key={r?.id??ri}>{columns.map((c,ci)=><td key={ci}>{c.render?c.render(r):r?.[c.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({ icon='📭', title='No data', subtitle='' }) {
  return (
    <div style={{ textAlign:'center', padding:'70px 20px', color:'var(--color-muted)' }}>
      <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:800, color:'#1e4035' }}>{title}</div>
      {subtitle && <div style={{ marginTop:6, fontSize:13, fontWeight:600 }}>{subtitle}</div>}
    </div>
  );
}

export function Divider({ style }) { return <div style={{ height:1, background:'var(--color-border-subtle)', ...style }} />; }

export function Modal({ open, onClose, title, width, children, footer }) {
  const closeRef = useRef(null);
  
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); };
  }, [open, onClose]);
  
  if (!open) return null;
  
  return (
    <div className="lt-modal-overlay" onMouseDown={e => e.target===e.currentTarget && onClose?.()} role="dialog" aria-modal="true">
      <div className="lt-modal" style={width ? { width: typeof width==='number' ? `${width}px` : width } : undefined}>
        <div className="lt-modal-header">
          <div className="lt-modal-title">{title}</div>
          <button ref={closeRef} className="lt-modal-close" onClick={onClose} type="button">×</button>
        </div>
        <div className="lt-modal-body">{children}</div>
        {footer && <div className="lt-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Fix Input component to use stable IDs
export function Input({ label, id, style, ...props }) {
  // Use a ref to generate stable ID only once
  const idRef = useRef(null);
  if (!idRef.current) {
    idRef.current = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  }
  const stableId = idRef.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label className="lt-field-label" htmlFor={stableId}>{label}</label>}
      <input id={stableId} className="lt-field" style={style} {...props} />
    </div>
  );
}

// Fix Select component
export function Select({ label, options = [], id, style, ...props }) {
  const idRef = useRef(null);
  if (!idRef.current) {
    idRef.current = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  }
  const stableId = idRef.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label className="lt-field-label" htmlFor={stableId}>{label}</label>}
      <select id={stableId} className="lt-field" style={style} {...props}>
        {options.map((o, i) => (
          <option key={i} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// Fix Textarea component
export function Textarea({ label, rows = 3, id, style, ...props }) {
  const idRef = useRef(null);
  if (!idRef.current) {
    idRef.current = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  }
  const stableId = idRef.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label className="lt-field-label" htmlFor={stableId}>{label}</label>}
      <textarea id={stableId} className="lt-field lt-textarea" rows={rows} style={style} {...props} />
    </div>
  );
}

// export function DeliveryBanner({ shipment }) {
//   const status = shipment?.currentStatus;
//   const theme = getStatusTheme(status);
//   const colors = {
//     success: { bg:'rgba(16,185,129,.08)', border:'rgba(16,185,129,.2)' },
//     danger:  { bg:'rgba(239,68,68,.08)',  border:'rgba(239,68,68,.2)' },
//     warning: { bg:'rgba(245,158,11,.1)',  border:'rgba(245,158,11,.25)' },
//     info:    { bg:'rgba(6,182,212,.08)',  border:'rgba(6,182,212,.2)' },
//     primary: { bg:'rgba(16,185,129,.08)', border:'rgba(16,185,129,.2)' },
//   }[theme]||{ bg:'rgba(16,185,129,.08)', border:'rgba(16,185,129,.2)' };
//   return (
//     <div style={{ marginTop:14, marginBottom:12, padding:14, borderRadius:12, background:colors.bg, border:`1px solid ${colors.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
//       <div>
//         <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'.5px', textTransform:'uppercase', color:'var(--color-muted)' }}>Shipment Route</div>
//         <div style={{ fontSize:13, fontWeight:700, marginTop:2 }}>{shipment?.origin} → {shipment?.destination}</div>
//       </div>
//       <StatusBadge status={status} size="lg" />
//     </div>
//   );
// }

export function Timeline({ items=[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {items.map((it, idx) => {
        const status = it?.status||it?.action||'';
        const theme = getStatusTheme(status);
        const dotColor = { success:'#10b981', danger:'#ef4444', warning:'#f59e0b', info:'#06b6d4', primary:'#10b981' }[theme]||'#10b981';
   const date  = it?.updatedAt||it?.timestamp||it?.createdAt;
const title = it?.status ? formatStatus(it.status) : (it?.action||it?.event||it?.details||'Update');
const by    = it?.updatedByEmail||it?.performedBy||it?.performedByEmail;
const hub   = it?.location||it?.hubName||it?.hubCity;
        return (
          <div key={it?.id??idx} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background:`${dotColor}22`, border:`2px solid ${dotColor}`, flexShrink:0, marginTop:3 }} />
              {idx < items.length-1 && <div style={{ width:2, height:24, background:'var(--color-border)', marginTop:2 }} />}
            </div>
            <div style={{ flex:1, paddingBottom:4 }}>
              <div style={{ display:'flex', gap:8, alignItems:'baseline', flexWrap:'wrap' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--color-text)' }}>{String(title).replace(/_/g,' ')}</div>
                {date && <div style={{ fontSize:11, fontWeight:600, color:'var(--color-muted)' }}>{new Date(date).toLocaleString()}</div>}
              </div>
              {hub && <div style={{ fontSize:12, color:'var(--color-muted)', marginTop:1 }}>📍 {hub}</div>}
              {by && <div style={{ fontSize:12, color:'var(--color-muted)', marginTop:1 }}>By {by}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
