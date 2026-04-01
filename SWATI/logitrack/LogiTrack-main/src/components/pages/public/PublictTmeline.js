/**
 * PublicTimeline — Consumer-facing delivery timeline
 * - Injects DELAYED / special rows from timeline items (not currentStatus)
 * - Deduplicates: only the most recent of each special status is shown
 * - Pending phases are collapsed to a minimal muted stub
 */

import React, { useMemo, useState } from 'react';

const PHASES = [
  { id: 'CREATED',          label: 'Order Placed',      description: 'Shipment registered and being processed.',          icon: '📦', matches: ['CREATED'] },
  { id: 'PICKED_UP',        label: 'Picked Up',          description: 'Package picked up and heading to the first hub.',   icon: '🚀', matches: ['DISPATCHED'] },
  { id: 'IN_TRANSIT',       label: 'In Transit',         description: 'Package moving through the delivery network.',      icon: '🚛', matches: ['IN_TRANSIT', 'ARRIVED'], isTransitGroup: true },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',   description: 'Package out for delivery and heading to you.',      icon: '🛵', matches: ['OUT_FOR_DELIVERY'] },
  { id: 'DELIVERED',        label: 'Delivered',          description: 'Package delivered successfully.',                   icon: '🏠', matches: ['DELIVERED'] },
];

const SPECIAL_META = {
  DELAYED:            { label: 'Shipment Delayed',     description: 'Your shipment is experiencing a delay.',             dotColor: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fde68a', textColor: '#92400e' },
  DELIVERY_ATTEMPTED: { label: 'Delivery Attempted',   description: 'Delivery was attempted but could not be completed.', dotColor: '#ef4444', bgColor: '#fef2f2', borderColor: '#fecaca', textColor: '#991b1b' },
  FAILED:             { label: 'Delivery Failed',       description: 'Delivery failed. Please contact support.',           dotColor: '#ef4444', bgColor: '#fef2f2', borderColor: '#fecaca', textColor: '#991b1b' },
  RETURNED_TO_SENDER: { label: 'Returned to Sender',   description: 'Package is being returned to the sender.',           dotColor: '#6b7280', bgColor: '#f9fafb', borderColor: '#e5e7eb', textColor: '#374151' },
  RESCHEDULED:        { label: 'Delivery Rescheduled', description: 'Delivery has been rescheduled.',                     dotColor: '#f97316', bgColor: '#fff7ed', borderColor: '#fed7aa', textColor: '#9a3412' },
};

const INJECTED_STATUSES = new Set(Object.keys(SPECIAL_META));

function normalize(s) {
  return String(s || '').toUpperCase().replace(/\s+/g, '_');
}

function formatDate(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return (
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );
}

function getActivePhaseIndex(currentStatus) {
  const s = normalize(currentStatus);
  if (['DELIVERY_ATTEMPTED', 'RESCHEDULED', 'FAILED', 'RETURNED_TO_SENDER'].includes(s)) return 3;
  if (s === 'DELAYED') return 1;
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (PHASES[i].matches.includes(s)) return i;
  }
  return 0;
}

function parseTransitStops(items) {
  if (!items?.length) return [];
  const hubMap = new Map();
  const ordered = [...items].reverse();
  for (const item of ordered) {
    const s = normalize(item?.status || '');
    const hub = item?.location;
    if (!hub || hub === 'System') continue;
    if (s === 'IN_TRANSIT') {
      if (!hubMap.has(hub)) hubMap.set(hub, { arrivedAt: item.updatedAt, departedAt: null });
      else hubMap.get(hub).arrivedAt = item.updatedAt;
    } else if (s === 'DISPATCHED') {
      if (hubMap.has(hub)) hubMap.get(hub).departedAt = item.updatedAt;
    }
  }
  const seen = new Set();
  const stops = [];
  for (const item of ordered) {
    const s = normalize(item?.status || '');
    const hub = item?.location;
    if (!hub || hub === 'System' || seen.has(hub)) continue;
    if (s === 'IN_TRANSIT' || (s === 'DISPATCHED' && hubMap.has(hub))) {
      seen.add(hub);
      const d = hubMap.get(hub) || {};
      stops.push({ hubName: hub, arrivedAt: d.arrivedAt || null, departedAt: d.departedAt || null });
    }
  }
  return stops;
}

// ─── Transit hub stop ────────────────────────────────────────────────────────
function TransitHubStop({ stop, isLast, isDone, isActive }) {
  const color     = isDone ? '#10b981' : isActive ? '#3b82f6' : '#d1d5db';
  const textColor = isDone || isActive ? '#111827' : '#9ca3af';
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, border: `2px solid ${color}`, flexShrink: 0, marginTop: 4, boxShadow: isActive ? `0 0 0 3px ${color}33` : 'none' }} />
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 18, background: isDone ? '#10b981' : '#e5e7eb', margin: '2px 0' }} />}
      </div>
      <div style={{ flex: 1, paddingLeft: 10, paddingBottom: isLast ? 2 : 14, paddingTop: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>🏭 {stop.hubName}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
          {stop.arrivedAt && <span style={{ fontSize: 11, color: '#6b7280' }}><span style={{ color: '#10b981', fontWeight: 700 }}>↓</span> Arrived {formatDate(stop.arrivedAt)}</span>}
          {stop.departedAt && <span style={{ fontSize: 11, color: '#6b7280' }}><span style={{ color: '#f59e0b', fontWeight: 700 }}>↑</span> Departed {formatDate(stop.departedAt)}</span>}
          {!stop.departedAt && (isDone || isActive) && <span style={{ fontSize: 11, color: isActive ? '#3b82f6' : '#9ca3af', fontStyle: 'italic' }}>{isActive ? 'Currently here' : 'En route'}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Phase row ───────────────────────────────────────────────────────────────
function PhaseRow({ phase, state, event, isLast, transitStops, isTransitExpanded, onToggleTransit }) {
  const isDone    = state === 'done';
  const isActive  = state === 'active';
  const isPending = state === 'pending';

  // Pending: minimal stub — just a muted label, no description, no timestamp
  if (isPending) {
    return (
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f8fafc', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e2e8f0' }} />
          </div>
          {!isLast && <div style={{ width: 2, flex: 1, minHeight: 18, background: '#f1f5f9', borderRadius: 2, margin: '2px 0' }} />}
        </div>
        <div style={{ flex: 1, paddingLeft: 16, paddingBottom: isLast ? 0 : 18, paddingTop: 5 }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: '#cbd5e1' }}>{phase.label}</div>
        </div>
      </div>
    );
  }

  const date     = event ? formatDate(event.updatedAt) : null;
  const hub      = event?.location && event.location !== 'System' ? event.location : null;
  const hasStops = phase.isTransitGroup && transitStops?.length > 0;

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#10b981', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isActive ? '0 0 0 6px #10b98122' : 'none', transition: 'all 0.3s', zIndex: 1 }}>
          {isDone ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4.5 4.5L16 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span style={{ fontSize: 20 }}>{phase.icon}</span>
          )}
        </div>
        {!isLast && <div style={{ width: 3, flex: 1, minHeight: 32, background: isDone ? '#10b981' : '#e2e8f0', borderRadius: 2, margin: '2px 0', transition: 'background 0.3s' }} />}
      </div>

      <div style={{ flex: 1, paddingLeft: 16, paddingBottom: isLast ? 0 : 28, paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>
            {phase.label}
            {hasStops && (
              <button onClick={onToggleTransit} style={{ marginLeft: 8, fontSize: 11, color: '#10b981', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, verticalAlign: 'middle' }}>
                {isTransitExpanded ? '▲ Hide hubs' : `▼ ${transitStops.length} hub${transitStops.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
          {date && <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>{date}</span>}
        </div>

        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>{phase.description}</div>

        {hub && !phase.isTransitGroup && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            {hub}
          </div>
        )}

        {phase.isTransitGroup && isTransitExpanded && hasStops && (
          <div style={{ marginTop: 12, background: '#f8fffe', border: '1px solid #d1fae5', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Route Progress</div>
            {transitStops.map((stop, i) => (
              <TransitHubStop key={stop.hubName + i} stop={stop} isLast={i === transitStops.length - 1} isDone={!!stop.departedAt} isActive={!!stop.arrivedAt && !stop.departedAt} />
            ))}
          </div>
        )}

        {phase.isTransitGroup && !isTransitExpanded && hasStops && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            {transitStops[0]?.hubName}{transitStops.length > 1 && ` → ${transitStops[transitStops.length - 1]?.hubName}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Injected special event row ──────────────────────────────────────────────
function InjectedRow({ item, meta, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const date = formatDate(item.updatedAt);

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: meta.bgColor, border: `2.5px solid ${meta.dotColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: meta.dotColor }} />
        </div>
        {!isLast && <div style={{ width: 3, flex: 1, minHeight: 28, background: '#e2e8f0', borderRadius: 2, margin: '2px 0' }} />}
      </div>

      <div style={{ flex: 1, paddingLeft: 16, paddingBottom: isLast ? 0 : 24, paddingTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: meta.textColor }}>{meta.label}</div>
          {date && <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{date}</span>}
        </div>
        <div style={{ fontSize: 13, color: meta.textColor, opacity: 0.75, marginTop: 2, lineHeight: 1.5 }}>{meta.description}</div>

        {item.details && (
          <div style={{ marginTop: 7 }}>
            <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 11, color: meta.textColor, background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 8, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>
              {expanded ? '▲ Hide details' : '▼ Show details'}
            </button>
            {expanded && (
              <div style={{ marginTop: 6, fontSize: 12, color: meta.textColor, background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 8, padding: '8px 12px', lineHeight: 1.6 }}>
                {item.details}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function PublicTimeline({ items = [], currentStatus }) {
  const [transitExpanded, setTransitExpanded] = useState(true);

  const activeIdx    = useMemo(() => getActivePhaseIndex(currentStatus), [currentStatus]);
  const transitStops = useMemo(() => parseTransitStops(items), [items]);

  const rows = useMemo(() => {
    function getPhaseEvent(phase) {
      for (const item of items) {
        if (phase.matches.includes(normalize(item.status || ''))) return item;
      }
      return null;
    }

    // Deduplicate injected statuses — keep only the most recent of each type
    // items are newest-first, so first occurrence = most recent
    const latestByStatus = new Map();
    for (const item of items) {
      const s = normalize(item.status || '');
      if (INJECTED_STATUSES.has(s) && !latestByStatus.has(s)) {
        latestByStatus.set(s, item);
      }
    }
    // Sort oldest-first for chronological insertion
    const injectedItems = [...latestByStatus.values()].sort(
      (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    );

    const phaseRows = PHASES.map((phase, i) => ({
      type: 'phase',
      phase,
      state: i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending',
      event: getPhaseEvent(phase),
    }));

    const result = [];
    const placed = new Set();

    for (let pi = 0; pi < phaseRows.length; pi++) {
      result.push(phaseRows[pi]);

      const thisTime = phaseRows[pi].event ? new Date(phaseRows[pi].event.updatedAt).getTime() : 0;
      const nextTime = pi + 1 < phaseRows.length && phaseRows[pi + 1].event
        ? new Date(phaseRows[pi + 1].event.updatedAt).getTime()
        : Infinity;

      for (const inj of injectedItems) {
        if (placed.has(inj)) continue;
        const injTime  = new Date(inj.updatedAt).getTime();
        const isLast   = pi === phaseRows.length - 1;
        if ((injTime >= thisTime && injTime < nextTime) || isLast) {
          const meta = SPECIAL_META[normalize(inj.status || '')];
          if (meta) { result.push({ type: 'injected', item: inj, meta }); placed.add(inj); }
        }
      }
    }

    return result;
  }, [items, activeIdx]);

  if (!rows.length) return null;

  return (
    <div style={{ padding: '8px 0' }}>
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1;
        if (row.type === 'phase') {
          return (
            <PhaseRow
              key={row.phase.id}
              phase={row.phase}
              state={row.state}
              event={row.event}
              isLast={isLast}
              transitStops={row.phase.isTransitGroup ? transitStops : null}
              isTransitExpanded={transitExpanded}
              onToggleTransit={() => setTransitExpanded(v => !v)}
            />
          );
        }
        if (row.type === 'injected') {
          return <InjectedRow key={row.item.id + idx} item={row.item} meta={row.meta} isLast={isLast} />;
        }
        return null;
      })}
    </div>
  );
}