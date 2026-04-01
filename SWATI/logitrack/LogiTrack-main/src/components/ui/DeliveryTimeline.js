/**
 * DeliveryTimeline — drop-in replacement for the Timeline section in ShipmentDetailModal
 *
 * Usage (in ShipmentDetailModal.jsx):
 *   import DeliveryTimeline from './DeliveryTimeline';
 *   ...
 *   {timeline.length > 0 && <DeliveryTimeline items={timeline} />}
 */

import React, { useMemo, useState } from 'react';

// ─── Status config ──────────────────────────────────────────────────────────────
const STATUS_META = {
  CREATED:          { icon: '📦', label: 'Created',          color: '#374151', bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af' },
  DISPATCHED:       { icon: '🚀', label: 'Dispatched',       color: '#b45309', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  IN_TRANSIT:       { icon: '🚛', label: 'In Transit',       color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
  OUT_FOR_DELIVERY: { icon: '🛵', label: 'Out for Delivery', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', dot: '#8b5cf6' },
  DELIVERED:        { icon: '✅', label: 'Delivered',        color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981' },
  DELAYED:          { icon: '⚠️', label: 'Delayed',          color: '#991b1b', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
  RESCHEDULED:      { icon: '📅', label: 'Rescheduled',      color: '#9a3412', bg: '#fff7ed', border: '#fed7aa', dot: '#f97316' },
  ATTEMPTED:        { icon: '🔔', label: 'Attempted',        color: '#92400e', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  ARRIVED:          { icon: '🏭', label: 'Arrived at Hub',   color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', dot: '#06b6d4' },
};

function normalize(s) {
  return String(s || '').toUpperCase().replace(/\s+/g, '_');
}

function getMeta(status) {
  return STATUS_META[normalize(status)] || {
    icon: '📍', label: String(status || '').replace(/_/g, ' '),
    color: '#374151', bg: '#f9fafb', border: '#e5e7eb', dot: '#6b7280',
  };
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// Group consecutive items with same status + same hub location
function groupItems(items) {
  if (!items?.length) return [];
  const groups = [];
  for (const item of items) {
    const key = normalize(item?.status || item?.action || '');
    const loc  = item?.location || item?.hubName || item?.hubCity || '';
    const last = groups[groups.length - 1];
    const lastKey = last ? normalize(last.primary?.status || last.primary?.action || '') : null;
    const lastLoc = last ? (last.primary?.location || last.primary?.hubName || last.primary?.hubCity || '') : null;
    if (!last || lastKey !== key || lastLoc !== loc) {
      groups.push({ primary: item, extras: [] });
    } else {
      last.extras.push(item);
    }
  }
  return groups;
}

// ─── Single row ─────────────────────────────────────────────────────────────────
function TimelineRow({ item, extras, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const status = item?.status || item?.action || '';
  const meta   = getMeta(status);
  const date   = item?.updatedAt || item?.timestamp || item?.createdAt;
  const by     = item?.updatedByEmail || item?.performedBy || item?.performedByEmail;
  const hub    = item?.location || item?.hubName || item?.hubCity;

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {/* Connector column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <div style={{ width: 2, height: isFirst ? 10 : 18, background: isFirst ? 'transparent' : '#d1fae5', flexShrink: 0 }} />
        <div style={{
          width: isFirst ? 18 : 12,
          height: isFirst ? 18 : 12,
          borderRadius: '50%',
          background: isFirst ? meta.dot : '#ffffff',
          border: `2px solid ${meta.dot}`,
          boxShadow: isFirst ? `0 0 0 4px ${meta.dot}28` : 'none',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          {isFirst && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, minHeight: 20, background: 'linear-gradient(to bottom,#d1fae5,#e5e7eb)', flexShrink: 0 }} />
        )}
      </div>

      {/* Card */}
      <div style={{ flex: 1, marginLeft: 10, marginBottom: isLast ? 0 : 6, marginTop: isFirst ? 2 : 10 }}>
        <div style={{
          background: isFirst ? meta.bg : '#fafffe',
          border: `1px solid ${isFirst ? meta.border : '#e8f8f2'}`,
          borderRadius: 10,
          padding: '10px 14px',
        }}>
          {/* Status + date */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15 }}>{meta.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: isFirst ? meta.color : '#1e4035', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {meta.label}
              </span>
              {extras.length > 0 && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  style={{
                    fontSize: 10.5, fontWeight: 700,
                    background: meta.dot + '1a', color: meta.color,
                    border: `1px solid ${meta.dot}44`, borderRadius: 20,
                    padding: '1px 8px', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>
                  {expanded ? '▲ less' : `+${extras.length} more`}
                </button>
              )}
            </div>
            {date && (
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {formatDate(date)}
              </span>
            )}
          </div>

          {/* Hub + actor */}
          {(hub || by) && (
            <div style={{ display: 'flex', gap: 14, marginTop: 5, flexWrap: 'wrap' }}>
              {hub && <span style={{ fontSize: 12, color: '#4b7063' }}>📍 {hub}</span>}
              {by  && <span style={{ fontSize: 12, color: '#6b7280' }}>👤 {by}</span>}
            </div>
          )}
        </div>

        {/* Expanded sub-events */}
        {expanded && extras.length > 0 && (
          <div style={{ marginTop: 3, paddingLeft: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {extras.map((ex, i) => {
              const exDate = ex?.updatedAt || ex?.timestamp || ex?.createdAt;
              const exBy   = ex?.updatedByEmail || ex?.performedBy || ex?.performedByEmail;
              const exHub  = ex?.location || ex?.hubName || ex?.hubCity;
              return (
                <div key={ex?.id || i} style={{
                  background: '#f8fffe', borderLeft: `3px solid ${meta.dot}`,
                  border: `1px solid #e2f5ec`, borderRadius: 7,
                  padding: '6px 12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {exHub && <span style={{ fontSize: 11.5, color: '#4b7063' }}>📍 {exHub}</span>}
                    {exBy  && <span style={{ fontSize: 11.5, color: '#6b7280' }}>👤 {exBy}</span>}
                  </div>
                  {exDate && <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(exDate)}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────────
export default function DeliveryTimeline({ items = [] }) {
  const groups = useMemo(() => groupItems(items), [items]);
  if (!groups.length) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span>📍</span> Delivery Timeline
          <span style={{ fontSize: 11, fontWeight: 700, background: '#d1fae5', color: '#065f46', borderRadius: 20, padding: '1px 8px', marginLeft: 4 }}>
            {groups.length} event{groups.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{items.length} total updates</span>
      </div>

      <div>
        {groups.map(({ primary, extras }, idx) => (
          <TimelineRow
            key={primary?.id || idx}
            item={primary}
            extras={extras}
            isFirst={idx === 0}
            isLast={idx === groups.length - 1}
          />
        ))}
      </div>
    </div>
  );
}