import React, { useEffect, useState } from 'react';
import { TrackingBadge, StatusBadge, Modal, Spinner } from './ui';
import { deliveryAPI, shipmentAPI } from '../services/api';
import { fmt } from '../utils/helpers';
import DeliveryTimeline from './ui/DeliveryTimeline';

export default function ShipmentDetailModal({ shipment, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeline, setTimeline]   = useState([]);
  const [route,    setRoute]      = useState([]);
  const [loading,  setLoading]    = useState(false);

  useEffect(() => {
    if (!shipment?.trackingId) return;
    setLoading(true);
    Promise.allSettled([
      deliveryAPI.getTimeline(shipment.trackingId),
      shipmentAPI.getRoute(shipment.trackingId),
    ]).then(([tRes, rRes]) => {
      if (tRes.status === 'fulfilled') setTimeline(tRes.value.data?.data || tRes.value.data || []);
      if (rRes.status === 'fulfilled') setRoute(rRes.value.data?.data  || rRes.value.data  || []);
    }).finally(() => setLoading(false));
  }, [shipment?.trackingId]);

  if (!shipment) return null;

  const TABS = [
    { id: 'overview', label: 'Overview',  icon: '📋' },
    { id: 'route',    label: 'Route',     icon: '🗺️' },
    { id: 'timeline', label: 'Timeline',  icon: '📍' },
  ];

  return (
    <Modal open={true} onClose={onClose} title="" width={760}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse2 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.85)} }
        .sdt-tab:hover { background: var(--em-50) !important; }
        .sdt-card:hover { box-shadow: var(--shadow-md) !important; border-color: var(--em-200) !important; }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{
        margin: '-18px -20px 0',
        padding: '20px 24px 0',
        background: 'linear-gradient(135deg, var(--em-50) 0%, #ecfeff 100%)',
        borderBottom: '1px solid var(--em-100)',
      }}>
        {/* Tracking ID + Status row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--color-muted)', marginBottom: 5 }}>
              Tracking ID
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '.04em' }}>
              {shipment.trackingId}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <StatusBadge status={shipment.currentStatus} size="lg" />
            {shipment.delayed && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a',
              }}>
                <span style={{ animation: 'pulse2 1.5s infinite', display: 'inline-block' }}>⏳</span> Delayed
              </span>
            )}
          </div>
        </div>

        {/* Mini route strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
          padding: '10px 14px', background: '#fff',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--em-100)',
        }}>
          <span style={{ fontSize: 13 }}>📍</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{shipment.origin || shipment.senderAddress || '—'}</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ flex: 1, height: 2, background: 'var(--em-200)', borderRadius: 1 }} />
            <span style={{ fontSize: 12 }}>✈️</span>
            <div style={{ flex: 1, height: 2, background: 'var(--em-200)', borderRadius: 1 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{shipment.destination || shipment.receiverAddress || '—'}</span>
          <span style={{ fontSize: 13 }}>🏁</span>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} className="sdt-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  background: active ? '#fff' : 'transparent',
                  color: active ? 'var(--em-700)' : 'var(--color-muted)',
                  borderBottom: active ? '2px solid var(--em-500)' : '2px solid transparent',
                  transition: 'all .15s',
                  marginBottom: active ? '-1px' : 0,
                }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ minHeight: 380, padding: '20px 4px 4px', animation: 'fadeUp .25s ease' }} key={activeTab}>

        {/* ════ OVERVIEW ════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Sender / Receiver */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <PartyCard role="Sender" name={shipment.senderName} address={shipment.senderAddress} extra="9875690322" accent="var(--em-500)" icon="👤" />
              <PartyCard role="Receiver" name={shipment.receiverName} address={shipment.receiverAddress} extra={shipment.receiverPhone} accent="#0ea5e9"  icon="👤"/>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              <StatTile  label="Weight"   value={`${shipment.weight || 0} kg`} />
              <StatTile  label="Created"  value={fmt(shipment.createdAt)} />
              
 <StatTile
  icon={shipment.currentStatus === 'DELIVERED' ? '✅' : shipment.delayed ? '⏳' : '🗓️'}
  label={shipment.currentStatus === 'DELIVERED' ? 'Delivered Date' : shipment.delayed ? 'Revised Delivery' : 'Expected Delivery'}
  value={shipment.currentStatus === 'DELIVERED' ? fmt(shipment.deliveredAt || shipment.updatedAt) : fmt(shipment.revisedDeliveryDate || shipment.expectedDeliveryDate)}
  accent={shipment.currentStatus === 'DELIVERED' ? 'var(--em-600)' : shipment.delayed ? '#b45309' : undefined}
/>
            </div>

            {/* Delay reason */}
            {shipment.delayed && shipment.delayReason && (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: '#fffbeb', border: '1px solid #fde68a',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 18 }}></span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#92400e', marginBottom: 2 }}>Delay Reason</div>
                  <div style={{ fontSize: 13, color: '#b45309', fontWeight: 500 }}>{shipment.delayReason}</div>
                </div>
              </div>
            )}

            {/* Description */}
            {shipment.description && (
              <div style={{ padding: '12px 14px', background: 'var(--em-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--em-100)' }}>
                <div style={LABEL}>Contents / Description</div>
                <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 4, fontWeight: 500 }}>{shipment.description}</div>
              </div>
            )}
          </div>
        )}

        {/* ════ ROUTE ════ */}
        {activeTab === 'route' && (
          <RouteView route={route} loading={loading} />
        )}

        {/* ════ TIMELINE ════ */}
        {activeTab === 'timeline' && (
          <div>
            {loading ? (
              <CenterBox><Spinner size={32} color="var(--em-500)" /></CenterBox>
            ) : timeline.length > 0 ? (
              <div style={{ background: 'var(--em-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--em-100)', padding: '16px 18px' }}>
                <DeliveryTimeline items={timeline} />
              </div>
            ) : (
              <CenterBox><Empty msg="No activity recorded yet." /></CenterBox>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ── Route view ── */
function RouteView({ route, loading }) {
  if (loading) return <CenterBox><Spinner size={32} color="var(--em-500)" /></CenterBox>;
  if (!route?.length) return <CenterBox><Empty msg="No route data available." /></CenterBox>;

  const completedCount = route.filter(s => ['DISPATCHED','DELIVERED'].includes(s.status)).length;
  const pct = Math.round((completedCount / route.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Progress summary */}
      <div style={{
        padding: '14px 18px', background: 'var(--em-50)',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--em-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
      }}>
        <div>
          <div style={LABEL}>Route Progress</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginTop: 3 }}>
            {completedCount} of {route.length} hubs completed
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ height: 8, background: 'var(--em-100)', borderRadius: 99 }}>
            <div style={{
              height: 8, borderRadius: 99, width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--em-500), var(--teal-500))',
              transition: 'width 1s ease', boxShadow: '0 0 8px rgba(16,185,129,.4)',
            }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4, fontWeight: 600, textAlign: 'right' }}>{pct}%</div>
        </div>
      </div>

      {/* Horizontal scrollable hub track */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 'max-content', padding: '8px 20px 4px' }}>
          {route.map((step, i) => {
            const done    = ['DISPATCHED', 'ARRIVED', 'DELIVERED'].includes(step.status);
            const current = step.isUnlocked && !done;
            const future  = !step.isUnlocked && !done;
            const isLast  = i === route.length - 1;

            const dotColor   = done ? 'var(--em-500)' : current ? '#f59e0b' : '#d1fae5';
            const dotBorder  = done ? 'var(--em-500)' : current ? '#f59e0b' : 'var(--em-200)';
            const labelColor = future ? 'var(--color-muted)' : 'var(--color-text)';

            return (
              <React.Fragment key={i}>
                {/* Hub node */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
                  {/* Outer ring */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: `2.5px solid ${dotBorder}`,
                    background: done ? 'var(--em-50)' : current ? '#fffbeb' : '#f8fffe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: current ? '0 0 0 4px #fef3c7' : done ? '0 0 0 4px var(--em-50)' : 'none',
                    transition: 'all .3s',
                    position: 'relative', zIndex: 2,
                  }}>
                    {/* Inner dot */}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: dotColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 13, fontWeight: 700,
                      boxShadow: current ? '0 0 10px rgba(245,158,11,.5)' : 'none',
                    }}>
                      {done
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : current
                          ? <span style={{ animation: 'pulse2 1.5s infinite', display: 'inline-block' }}>•</span>
                          : <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>{i + 1}</span>
                      }
                    </div>
                    {/* Live badge for current */}
                    {current && (
                      <div style={{
                        position: 'absolute', top: -8, right: -8,
                        fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99,
                        background: '#f59e0b', color: '#fff', letterSpacing: '.04em',
                      }}>LIVE</div>
                    )}
                  </div>

                  {/* Labels */}
                  <div style={{ marginTop: 10, textAlign: 'center' }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: labelColor,
                      maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {step.hubCity || step.hubName}
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, marginTop: 3,
                      color: done ? 'var(--em-700)' : current ? '#d97706' : 'var(--color-muted)',
                      textTransform: 'uppercase', letterSpacing: '.04em',
                    }}>
                      {step.status?.replace(/_/g, ' ')}
                    </div>
                    {step.updatedAt && (
                      <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>
                        {new Date(step.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div style={{
                    height: 3, width: 48, marginTop: 22, zIndex: 1, flexShrink: 0,
                    background: done
                      ? 'linear-gradient(90deg, var(--em-500), var(--em-400))'
                      : future
                        ? 'repeating-linear-gradient(90deg, var(--em-200) 0, var(--em-200) 6px, transparent 6px, transparent 12px)'
                        : 'var(--em-200)',
                    borderRadius: 2,
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Current location banner */}
      {(() => {
        const cur = route.find(s => s.isUnlocked && !['DISPATCHED','DELIVERED'].includes(s.status));
        return cur ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 16px', borderRadius: 'var(--radius-md)',
            background: '#fffbeb', border: '1px solid #fde68a',
          }}>
            <span style={{ fontSize: 16, animation: 'pulse2 2s infinite', display: 'inline-block' }}>📍</span>
            <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
              Currently at: <strong>{cur.hubName}</strong>
              {cur.hubCity && cur.hubCity !== cur.hubName && <span style={{ fontWeight: 400 }}>, {cur.hubCity}</span>}
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}

/* ── Sub-components ── */
function PartyCard({ role, name, address, extra, accent, icon }) {
  return (
    <div className="sdt-card" style={{
      background: '#fff', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--em-100)', padding: '14px 16px',
      borderLeft: `3px solid ${accent}`,
      transition: 'all .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8, fontSize: 13,
          background: 'var(--em-50)', border: '1px solid var(--em-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</span>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--color-muted)' }}>{role}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{name || '—'}</div>
      <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>{address || '—'}</div>
      {extra && <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600, color: accent }}>{extra}</div>}
    </div>
  );
}

function StatTile({ icon, label, value, accent }) {
  return (
    <div className="sdt-card" style={{
      background: 'var(--em-50)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--em-100)', padding: '12px 14px',
      transition: 'all .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <div style={LABEL}>{label}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: accent || 'var(--color-text)' }}>{value || '—'}</div>
    </div>
  );
}

const CenterBox = ({ children }) => (
  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
);

const Empty = ({ msg }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
    <div style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>{msg}</div>
  </div>
);

const LABEL = {
  fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '.08em', color: 'var(--color-muted)',
};