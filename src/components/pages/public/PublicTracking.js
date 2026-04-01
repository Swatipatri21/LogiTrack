import React, { useState, useRef } from 'react';
import { trackingAPI } from '../../../services/api';
import PublicTimeline from './PublictTmeline';

/* ── helpers ── */
function fmt(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtShort(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function fmtFull(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function progressPct(status) {
  const map = {
    CREATED: 5, DISPATCHED: 22, IN_TRANSIT: 50, ARRIVED: 50,
    OUT_FOR_DELIVERY: 78, DELIVERY_ATTEMPTED: 78,
    DELIVERED: 100, FAILED: 100, RETURNED_TO_SENDER: 100,
  };
  return map[String(status || '').toUpperCase()] ?? 5;
}

const STATUS_CFG = {
  CREATED:            { label: 'Order Placed',     color: '#047857', bg: '#ecfdf5',  border: '#a7f3d0', icon: '📦', dot: '#10b981' },
  DISPATCHED:         { label: 'Picked Up',         color: '#0369a1', bg: '#eff6ff',  border: '#bfdbfe', icon: '🚀', dot: '#3b82f6' },
  IN_TRANSIT:         { label: 'In Transit',        color: '#047857', bg: '#ecfdf5',  border: '#a7f3d0', icon: '🚛', dot: '#10b981' },
  OUT_FOR_DELIVERY:   { label: 'Out for Delivery',  color: '#6d28d9', bg: '#f5f3ff',  border: '#ddd6fe', icon: '🛵', dot: '#7c3aed' },
  DELIVERY_ATTEMPTED: { label: 'Attempted',         color: '#b45309', bg: '#fffbeb',  border: '#fde68a', icon: '🔔', dot: '#f59e0b' },
  DELIVERED:          { label: 'Delivered',         color: '#15803d', bg: '#f0fdf4',  border: '#86efac', icon: '✅', dot: '#22c55e' },
  FAILED:             { label: 'Failed',            color: '#b91c1c', bg: '#fef2f2',  border: '#fecaca', icon: '❌', dot: '#ef4444' },
  RETURNED_TO_SENDER: { label: 'Returned',          color: '#374151', bg: '#f9fafb',  border: '#e5e7eb', icon: '↩️', dot: '#9ca3af' },
  DELAYED:            { label: 'Delayed',           color: '#b45309', bg: '#fffbeb',  border: '#fde68a', icon: '⏳', dot: '#f59e0b' },
};
function sCfg(s) { return STATUS_CFG[String(s || '').toUpperCase()] || STATUS_CFG.CREATED; }

function StatusPill({ status }) {
  const c = sCfg(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px', borderRadius: 999,
      background: c.bg, color: c.color,
      border: `1.5px solid ${c.border}`,
      fontSize: 12, fontWeight: 800, letterSpacing: '.02em',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0, boxShadow: `0 0 0 3px ${c.dot}30` }} />
      {c.icon} {c.label}
    </span>
  );
}

function RouteBar({ shipment, pct }) {
  const isDelivered = String(shipment.currentStatus).toUpperCase() === 'DELIVERED';
  const isFailed    = ['FAILED','RETURNED_TO_SENDER'].includes(String(shipment.currentStatus).toUpperCase());
  const barColor    = isFailed ? '#ef4444' : 'linear-gradient(90deg, #10b981, #0d9488)';

  return (
    <div style={{ padding: '4px 0 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af' }}>Origin</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#065f46' }}>{shipment.origin}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af' }}>Destination</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#065f46' }}>{shipment.destination}</span>
        </div>
      </div>

      <div style={{ position: 'relative', height: 10, background: '#e5e7eb', borderRadius: 99, marginBottom: 6 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`, borderRadius: 99,
          background: barColor,
          transition: 'width 1.4s cubic-bezier(.4,0,.2,1)',
          boxShadow: isFailed ? 'none' : '0 0 12px rgba(16,185,129,.4)',
        }} />
        {!isDelivered && !isFailed && (
          <div style={{
            position: 'absolute', left: `calc(${pct}% - 18px)`, top: -14,
            fontSize: 24, transition: 'left 1.4s cubic-bezier(.4,0,.2,1)',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.2))',
          }}>
            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🚚</span>
          </div>
        )}
        {isDelivered && (
          <div style={{ position: 'absolute', right: -6, top: -13, fontSize: 22 }}>🏠</div>
        )}
        {isFailed && (
          <div style={{ position: 'absolute', right: -4, top: -12, fontSize: 20 }}>❌</div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#10b981', fontWeight: 700 }}>
        <span>📍</span>
        <span style={{ color: '#9ca3af', fontWeight: 600 }}>{pct}% complete</span>
        <span>🏁</span>
      </div>
    </div>
  );
}

function getDateInfo(shipment, timeline) {
  const s = String(shipment.currentStatus || '').toUpperCase();
  if (s === 'DELIVERED') {
    const ev = timeline.find(t => String(t.status).toUpperCase() === 'DELIVERED');
    const ts = shipment.deliveredAt || ev?.updatedAt;
    return { label: 'Delivered On', value: ts ? fmtFull(ts) : fmt(shipment.revisedDeliveryDate || shipment.expectedDeliveryDate), color: '#15803d', icon: '🎉', strike: null };
  }
  if (s === 'FAILED' || s === 'RETURNED_TO_SENDER') {
    return { label: 'Status', value: sCfg(s).label, color: '#b91c1c', icon: sCfg(s).icon, strike: null };
  }
  if (shipment.delayed && shipment.revisedDeliveryDate) {
    return { label: 'Revised Delivery', value: fmt(shipment.revisedDeliveryDate), color: '#b45309', icon: '⏳', strike: fmt(shipment.expectedDeliveryDate) };
  }
  return { label: 'Expected Delivery', value: fmt(shipment.revisedDeliveryDate || shipment.expectedDeliveryDate), color: '#047857', icon: '📅', strike: null };
}

/* ── Search Bar ── */
function SearchBar({ trackingId, setTrackingId, track, loading, reset, focused, setFocused, inputRef }) {
  return (
    <div style={{
      display: 'flex',
      background: '#fff',
      borderRadius: 16,
      border: `2px solid ${focused ? '#10b981' : '#e5e7eb'}`,
      boxShadow: focused ? '0 0 0 4px rgba(16,185,129,.12), 0 8px 32px rgba(0,0,0,.08)' : '0 2px 12px rgba(0,0,0,.06)',
      transition: 'all .2s',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '4px 18px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          value={trackingId}
          onChange={e => setTrackingId(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && track()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter tracking ID  ·  e.g. TRK-ABC12345"
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: 16, fontWeight: 600, color: '#111827',
            fontFamily: 'ui-monospace, "Cascadia Code", monospace',
            background: 'transparent', letterSpacing: 0.5,
            padding: '15px 0',
          }}
        />
        {trackingId && (
          <button onClick={reset} style={{
            background: '#f3f4f6', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: 13, lineHeight: 1,
            padding: '5px 8px', borderRadius: 6, flexShrink: 0,
            fontWeight: 700,
          }}>✕</button>
        )}
      </div>
      <button
        onClick={track}
        disabled={loading}
        style={{
          padding: '0 36px',
          background: loading ? '#6ee7b7' : 'linear-gradient(135deg, #059669, #0d9488)',
          color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 14, fontWeight: 800, letterSpacing: '.02em',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8,
          borderLeft: '2px solid rgba(255,255,255,.1)',
          transition: 'background .2s',
          minWidth: 140,
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin .8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Tracking…
          </>
        ) : (
          <>📦 Track</>
        )}
      </button>
    </div>
  );
}

export default function PublicTracking({ onLogin }) {
  const [trackingId, setTrackingId] = useState('');
  const [shipment,   setShipment]   = useState(null);
  const [timeline,   setTimeline]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [focused,    setFocused]    = useState(false);
  const inputRef = useRef(null);

  const reset = () => { setShipment(null); setTimeline([]); setError(null); setTrackingId(''); };

  const track = async () => {
    const id = trackingId.trim();
    if (!id) { setError('Please enter a tracking ID.'); return; }
    setLoading(true); setError(null); setShipment(null); setTimeline([]);
    try {
      const res     = await trackingAPI.track(id);
      const raw     = res.data?.data || res.data;
      const details = raw.shipmentDetails || raw;
      setShipment({
        trackingId:           details.trackingId,
        currentStatus:        details.currentStatus,
        origin:               details.origin,
        destination:          details.destination,
        senderName:           details.senderName,
        receiverName:         details.receiverName,
        expectedDeliveryDate: details.expectedDeliveryDate,
        revisedDeliveryDate:  details.revisedDeliveryDate,
        deliveredAt:          details.deliveredAt,
        weight:               details.weight,
        description:          details.description,
        delayed:              details.delayed,
        delayReason:          details.delayReason,
        createdAt:            details.createdAt,
      });
      const rawTl = raw.statusTimeline || raw.timeline || raw.history || [];
      setTimeline(rawTl.map(item => ({
        id: item.id, status: item.status,
        updatedAt: item.updatedAt || item.timestamp || item.createdAt,
        location:  item.location  || item.hubName || item.hubCity,
        performedBy: item.updatedByEmail || item.performedBy,
        details:   item.remarks || item.details,
      })));
    } catch (err) {
      setError(err?.response?.data?.message || 'Shipment not found. Please check the tracking ID and try again.');
    } finally { setLoading(false); }
  };

  const pct         = shipment ? progressPct(shipment.currentStatus) : 0;
  const dateInfo    = shipment ? getDateInfo(shipment, timeline) : null;
  const statusCfg   = shipment ? sCfg(shipment.currentStatus) : null;
  const isDelivered = shipment && String(shipment.currentStatus).toUpperCase() === 'DELIVERED';

  const searchProps = { trackingId, setTrackingId, track, loading, reset, focused, setFocused, inputRef };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.6} }
        .track-result { animation: fadeUp .3s ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(16,185,129,.12) !important; }
        .feature-card { transition: transform .2s, box-shadow .2s !important; }
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,.95)',
        borderBottom: '1px solid #e5e7eb',
        backdropFilter: 'blur(16px)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(16,185,129,.3)',
          }}>
            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🚚</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, color: '#111827', letterSpacing: '-0.5px', fontFamily: "'DM Sans', sans-serif" }}>
            Logi<span style={{ color: '#059669' }}>Track</span>
          </span>
        </div>

        <button
          onClick={onLogin}
          style={{
            padding: '8px 22px',
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '.02em',
            boxShadow: '0 4px 12px rgba(16,185,129,.25)',
            transition: 'opacity .15s',
          }}
        >
          Sign In →
        </button>
      </nav>

      {/* ══ HERO ══ */}
      {!shipment && (
        <>
          <div style={{
            background: 'linear-gradient(180deg, #fff 0%, #f0fdf9 60%, #f9fafb 100%)',
            padding: 'clamp(48px, 6vw, 80px) 24px clamp(56px, 7vw, 80px)',
            textAlign: 'center',
            borderBottom: '1px solid #e5e7eb',
          }}>
            {/* Live badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 18px', borderRadius: 999,
              background: '#f0fdf4', border: '1.5px solid #a7f3d0',
              fontSize: 12, fontWeight: 700, color: '#065f46',
              marginBottom: 28, letterSpacing: '.04em',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-dot 1.8s infinite' }} />
              REAL-TIME HUB TRACKING ACROSS INDIA
            </div>

            <h1 style={{
              fontSize: 'clamp(38px, 6vw, 68px)',
              fontWeight: 900, color: '#111827',
              lineHeight: 1.08, margin: '0 0 16px',
              letterSpacing: '-2.5px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Track your shipment.<br />
              <span style={{
                background: 'linear-gradient(135deg, #059669, #0d9488)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Every hub. Every update.
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              color: '#6b7280', margin: '0 auto 36px',
              lineHeight: 1.7, maxWidth: 460,
              fontWeight: 400,
            }}>
              Enter your tracking ID for live delivery status,
              full route visibility, and real-time milestone updates.
            </p>

            {/* Search */}
            <div style={{ maxWidth: 680, margin: '0 auto 16px' }}>
              <SearchBar {...searchProps} />
            </div>

            {error && (
              <div style={{
                maxWidth: 680, margin: '12px auto 0',
                padding: '12px 16px', borderRadius: 10,
                background: '#fef2f2', border: '1.5px solid #fecaca',
                color: '#b91c1c', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'inline-flex', gap: 0, marginTop: 36, background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
              {[
                { value: '15+', label: 'Hubs across India' },
                { value: '98%', label: 'On-time delivery' },
                { value: '24/7', label: 'Live tracking' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '14px 32px',
                  borderRight: i < 2 ? '1.5px solid #e5e7eb' : 'none',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#059669', letterSpacing: '-1px', fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ FEATURES ══ */}
          <section style={{ padding: 'clamp(56px, 6vw, 80px) 40px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#059669', marginBottom: 12 }}>Why LogiTrack?</div>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-1px', fontFamily: "'DM Sans', sans-serif" }}>
                Everything you need to track &amp; manage
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { icon: '⚡', title: 'Real-Time Updates', desc: 'Live shipment tracking across our entire hub network. Know exactly where your package is at every step.' },
                { icon: '🗺️', title: 'Multi-Hub Routing', desc: 'Intelligent routing through 15+ distribution hubs across India for the fastest, most reliable delivery.' },
                { icon: '🔔', title: 'Smart Notifications', desc: 'Get instant alerts for every status change, delay, or delivery confirmation — via email and SMS.' },
                { icon: '📊', title: 'Analytics Dashboard', desc: 'Powerful insights on delivery performance, delay trends, and hub efficiency for data-driven decisions.' },
                { icon: '🔒', title: 'OTP Verification', desc: 'Secure delivery confirmation with one-time passwords ensuring packages reach the right hands.' },
                { icon: '📈', title: 'SLA Monitoring', desc: 'Track on-time delivery percentages and get breach alerts before they impact your customers.' },
              ].map((f, i) => (
                <div key={i} className="feature-card" style={{
                  background: '#fff', borderRadius: 16, padding: '28px 24px',
                  border: '1.5px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, marginBottom: 18,
                    border: '1.5px solid #a7f3d0',
                  }}>{f.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section style={{
            background: 'linear-gradient(135deg, #064e3b, #065f46, #047857)',
            padding: 'clamp(56px, 6vw, 72px) 40px',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,.1)',
              borderRadius: 999, padding: '6px 16px',
              fontSize: 11, fontWeight: 800, color: '#6ee7b7',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Enterprise Logistics Platform
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-1px', fontFamily: "'DM Sans', sans-serif" }}>
              Ready to streamline your logistics?
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', margin: '0 auto 32px', maxWidth: 440, lineHeight: 1.6 }}>
              Join hundreds of businesses managing their shipments efficiently with LogiTrack.
            </p>
            <button
              onClick={onLogin}
              style={{
                padding: '14px 36px',
                background: '#fff', color: '#065f46',
                border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '.01em',
                boxShadow: '0 8px 24px rgba(0,0,0,.2)',
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(0,0,0,.25)'; }}
              onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,.2)'; }}
            >
              Get Started →
            </button>
          </section>

          {/* ══ FOOTER ══ */}
          <footer style={{ background: '#111827', padding: '28px 40px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ display: 'inline-block', transform: 'scaleX(-1)', fontSize: 18 }}>🚚</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>LogiTrack</span>
            </div>
            <div style={{ fontSize: 12, color: '#4b5563' }}>© {new Date().getFullYear()} LogiTrack Enterprise Logistics Platform. All rights reserved.</div>
          </footer>
        </>
      )}

      {/* ══ RESULTS ══ */}
      {shipment && (
        <div className="track-result" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 72px' }}>

          {/* Search bar on results page */}
          <div style={{ marginBottom: 20 }}>
            <SearchBar {...searchProps} />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 16,
              background: '#fef2f2', border: '1.5px solid #fecaca',
              color: '#b91c1c', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── CARD 1: Status + Route ── */}
          <div style={{
            background: '#fff', borderRadius: 20,
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
            marginBottom: 14, overflow: 'hidden',
          }}>
            {/* Top accent bar */}
            <div style={{
              height: 5,
              background: isDelivered
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : shipment.delayed
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #10b981, #0d9488)',
            }} />

            <div style={{ padding: '22px 24px' }}>
              {/* Tracking ID + Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#9ca3af', marginBottom: 5 }}>Tracking ID</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '.04em' }}>
                    {shipment.trackingId}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                  <StatusPill status={shipment.currentStatus} />
                  {shipment.delayed && !isDelivered && <StatusPill status="DELAYED" />}
                </div>
              </div>

              {/* Route bar */}
              <RouteBar shipment={shipment} pct={pct} />
            </div>

            {/* Delivery date banner */}
            {dateInfo && (
              <div style={{
                margin: '0 24px 20px',
                padding: '16px 20px',
                borderRadius: 14,
                background: isDelivered ? '#f0fdf4' : shipment.delayed ? '#fffbeb' : '#f0fdf9',
                border: `1.5px solid ${isDelivered ? '#86efac' : shipment.delayed ? '#fde68a' : '#a7f3d0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#9ca3af', marginBottom: 5 }}>{dateInfo.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: dateInfo.color, fontFamily: "'DM Sans', sans-serif" }}>{dateInfo.value}</div>
                  {dateInfo.strike && (
                    <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through', marginTop: 3 }}>Was: {dateInfo.strike}</div>
                  )}
                </div>
                <span style={{ fontSize: 32 }}>{dateInfo.icon}</span>
              </div>
            )}

            {/* Sender / Receiver */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 24px 24px' }}>
              {[
                { label: 'From', name: shipment.senderName, loc: shipment.origin, accent: '#059669' },
                { label: 'To',   name: shipment.receiverName, loc: shipment.destination, accent: '#0369a1' },
              ].map(p => (
                <div key={p.label} style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: '#f9fafb', border: '1.5px solid #e5e7eb',
                  borderLeft: `4px solid ${p.accent}`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', marginBottom: 5 }}>{p.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{p.loc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Delay alert */}
          {shipment.delayed && !isDelivered && (
            <div style={{
              padding: '14px 18px', borderRadius: 14, marginBottom: 14,
              background: '#fffbeb', border: '1.5px solid #fde68a',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 800, color: '#92400e', marginBottom: 3, fontSize: 13 }}>Shipment Delayed</div>
                <div style={{ fontWeight: 500, fontSize: 12, color: '#b45309', lineHeight: 1.6 }}>
                  {shipment.delayReason || 'Your shipment is running behind schedule.'}
                  {shipment.revisedDeliveryDate && <> New estimated delivery: <strong>{fmt(shipment.revisedDeliveryDate)}</strong>.</>}
                </div>
              </div>
            </div>
          )}

          {/* ── CARD 2: Meta ── */}
          <div style={{
            background: '#fff', borderRadius: 20,
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
            marginBottom: 14, padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>
              Package Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Weight', value: `${shipment.weight} kg` },
                { label: 'Booked On', value: fmtShort(shipment.createdAt) },
                { label: 'Status', value: `${statusCfg.icon} ${statusCfg.label}`, color: statusCfg.color },
              ].map(t => (
                <div key={t.label} style={{
                  background: '#f9fafb', border: '1.5px solid #e5e7eb',
                  borderRadius: 12, padding: '13px 15px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', marginBottom: 5 }}>{t.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.color || '#111827' }}>{t.value}</div>
                </div>
              ))}
            </div>
            {shipment.description && (
              <div style={{ marginTop: 12, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '13px 15px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', marginBottom: 5 }}>Contents</div>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{shipment.description}</div>
              </div>
            )}
          </div>

          {/* ── CARD 3: Timeline ── */}
          {timeline.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: 20,
              border: '1.5px solid #e5e7eb',
              boxShadow: '0 4px 24px rgba(0,0,0,.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '18px 24px 16px',
                borderBottom: '1.5px solid #f3f4f6',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'linear-gradient(135deg, #059669, #0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, boxShadow: '0 4px 12px rgba(16,185,129,.25)',
                }}>📍</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>Delivery Timeline</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{timeline.length} events recorded</div>
                </div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <PublicTimeline items={timeline} currentStatus={shipment.currentStatus} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}