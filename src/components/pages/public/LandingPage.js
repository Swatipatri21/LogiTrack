import React, { useState } from 'react';
import { Alert, Button, Spinner, StatusBadge, TrackingBadge } from '../../ui';
import { trackingAPI } from '../../../services/api';
import PublicTimeline from './PublictTmeline';
// import { StatusBadge, TrackingBadge, DeliveryBanner, line } from '../../ui';
// import PublicTimeline from './PublictTmeline';

export default function LandingPage({ onLogin, onSignup }) {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const track = async () => {
    if (!trackingId.trim()) { setError('Please enter a tracking ID.'); return; }
    setLoading(true); setError(null); setShipment(null); setTimeline([]);
    try {
      const res = await trackingAPI.track(trackingId.trim());
      const d = res.data?.data || res.data;
      setShipment(d?.shipmentDetails || d);
      setTimeline(d?.statusTimeline || d?.timeline || []);
    } catch { setError('Shipment not found. Please check your tracking ID.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f0fdf9', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #d1fae5', padding:'0 40px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(16,185,129,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, background:'linear-gradient(135deg,#10b981,#059669)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 3px 10px rgba(16,185,129,.4)' }}>🚚</div>
          <span style={{ fontSize:18, fontWeight:900, color:'#065f46', letterSpacing:'-.3px' }}>LogiTrack</span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onLogin} style={{ padding:'8px 20px', border:'1.5px solid #a7f3d0', borderRadius:8, background:'transparent', color:'#047857', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#ecfdf5'; }} onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
            Sign In
          </button>
          <button onClick={onSignup} style={{ padding:'8px 20px', border:'none', borderRadius:8, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 10px rgba(16,185,129,.35)' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg, #065f46 0%, #047857 40%, #059669 100%)', padding:'72px 40px 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'rgba(52,211,153,.12)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:320, height:320, borderRadius:'50%', background:'rgba(20,184,166,.1)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:680, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:20, padding:'6px 14px', marginBottom:22, fontSize:12, fontWeight:700, color:'#a7f3d0', letterSpacing:'.5px' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', animation:'pulse 2s infinite', display:'inline-block' }} />
            REAL-TIME SHIPMENT TRACKING
          </div>
          <h1 style={{ fontSize:48, fontWeight:900, color:'#fff', margin:'0 0 16px', letterSpacing:'-1.5px', lineHeight:1.1 }}>
            Track Your Packages<br /><span style={{ color:'#6ee7b7' }}>With Precision</span>
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,.75)', margin:'0 0 36px', lineHeight:1.6 }}>Enter your tracking ID below for instant, real-time delivery updates from sender to doorstep.</p>

          {/* Tracking Box */}
          <div style={{ background:'rgba(255,255,255,.1)', backdropFilter:'blur(12px)', borderRadius:16, padding:6, border:'1px solid rgba(255,255,255,.2)', maxWidth:560, margin:'0 auto' }}>
            <div style={{ display:'flex', gap:6 }}>
              <input value={trackingId} onChange={e=>setTrackingId(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&track()}
                placeholder="Enter tracking ID  e.g. TRK-XXXXXXXX"
                style={{ flex:1, padding:'14px 18px', border:'none', borderRadius:11, fontSize:15, fontWeight:600, color:'#065f46', outline:'none', background:'#fff', fontFamily:'inherit', letterSpacing:'.5px' }} />
              <button onClick={track} disabled={loading} style={{ padding:'14px 24px', background:'linear-gradient(135deg,#059669,#047857)', color:'#fff', border:'none', borderRadius:11, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', boxShadow:'0 4px 14px rgba(0,0,0,.2)' }}>
                {loading ? <Spinner size={16} color="#fff" /> : '🔍'} {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
          </div>
          {error && <div style={{ marginTop:12, maxWidth:560, margin:'12px auto 0' }}><Alert message={error} type="danger" /></div>}
        </div>
      </section>

      {/* Tracking Result */}
      {shipment && (
        <section style={{ maxWidth:760, margin:'-30px auto 0', padding:'0 24px 40px', position:'relative', zIndex:10 }}>
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #d1fae5', boxShadow:'0 10px 40px rgba(16,185,129,.12)', padding:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <TrackingBadge id={shipment.trackingId} size="lg" />
              <StatusBadge status={shipment.currentStatus} size="lg" />
            </div>
            {/* <DeliveryBanner shipment={shipment} /> */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[['From', shipment.origin],['To', shipment.destination],['Sender', shipment.senderName],['Receiver', shipment.receiverName]].map(([l,v])=>(
                <div key={l} style={{ background:'#f0fdf9', borderRadius:9, padding:'10px 14px', border:'1px solid #d1fae5' }}>
                  <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.5px', color:'#4b7063', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:'#0f2b22' }}>{v||'—'}</div>
                </div>
              ))}
            </div>
            {timeline.length > 0 && (
              <>
                <div style={{ fontSize:13.5, fontWeight:800, color:'#065f46', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                  <span>📍</span> Delivery Timeline
                </div>
                <PublicTimeline items={timeline} currentStatus={shipment.currentStatus} />
              </>
            )}
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding:'72px 40px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:50 }}>
          <div style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.5px', color:'#10b981', marginBottom:10 }}>Why LogiTrack?</div>
          <h2 style={{ fontSize:34, fontWeight:900, color:'#065f46', margin:0, letterSpacing:'-.5px' }}>Everything You Need to Track & Manage</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
          {[
            { icon:'⚡', title:'Real-Time Updates', desc:'Live shipment tracking across our entire hub network. Know exactly where your package is at every step.' },
            { icon:'🗺', title:'Multi-Hub Routing', desc:'Intelligent routing through our 15+ distribution hubs across India for the fastest delivery.' },
            { icon:'🔔', title:'Smart Notifications', desc:'Get instant alerts via email and SMS for every status change, delay, or delivery confirmation.' },
            { icon:'📊', title:'Analytics Dashboard', desc:'Powerful insights on delivery performance, delay trends, and hub efficiency for data-driven decisions.' },
            { icon:'🔒', title:'OTP Verification', desc:'Secure delivery confirmation with one-time passwords ensuring packages reach the right hands.' },
            { icon:'📈', title:'SLA Monitoring', desc:'Track on-time delivery percentages and get breach alerts before they impact your customers.' },
          ].map((f,i) => (
            <div key={i} style={{ background:'#fff', borderRadius:14, padding:26, border:'1px solid #d1fae5', transition:'transform .2s, box-shadow .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 30px rgba(16,185,129,.15)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
              <div style={{ width:50, height:50, background:'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:16, border:'1px solid #a7f3d0' }}>{f.icon}</div>
              <div style={{ fontSize:15, fontWeight:800, color:'#065f46', marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'#4b7063', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg,#065f46,#047857)', padding:'60px 40px', textAlign:'center' }}>
        <h2 style={{ fontSize:32, fontWeight:900, color:'#fff', margin:'0 0 14px', letterSpacing:'-.5px' }}>Ready to Streamline Your Logistics?</h2>
        <p style={{ fontSize:15, color:'rgba(255,255,255,.75)', margin:'0 0 30px' }}>Join hundreds of businesses managing their shipments with LogiTrack.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={onSignup} style={{ padding:'13px 32px', background:'#fff', color:'#065f46', border:'none', borderRadius:10, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Get Started Free →</button>
          <button onClick={onLogin}  style={{ padding:'13px 32px', background:'transparent', color:'#fff', border:'2px solid rgba(255,255,255,.4)', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Sign In</button>
        </div>
      </section>

      <footer style={{ background:'#071c13', padding:'24px 40px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:10 }}>
          <div style={{ fontSize:18 }}>🚚</div>
          <span style={{ fontSize:15, fontWeight:800, color:'#ecfdf5' }}>LogiTrack</span>
        </div>
        <div style={{ fontSize:12, color:'#2d6a47' }}>© {new Date().getFullYear()} LogiTrack Enterprise Logistics Platform</div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
