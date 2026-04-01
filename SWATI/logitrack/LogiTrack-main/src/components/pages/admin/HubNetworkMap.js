import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function HubNetworkMap({ hubs = [], getManager, open, onClose }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const linesRef = useRef([]);
  const [showLines, setShowLines] = useState(false);

  const dotIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 0 0 2px ${color}44"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10],
  });

  useEffect(() => {
    if (!open || !mapRef.current || instanceRef.current) return;

    const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView([22.5, 80], 5);

    // Carto light tiles — clean, no clutter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO', maxZoom: 18,
    }).addTo(map);

    hubs.forEach(hub => {
      const lat = hub.lat ?? hub.latitude;
      const lng = hub.lng ?? hub.longitude;
      if (!lat || !lng) return;

      const mgr = getManager(hub.id);
      const color = hub.active === false ? '#94a3b8' : !mgr ? '#f97316' : '#1D9E75';

      L.marker([lat, lng], { icon: dotIcon(color) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-weight:600;font-size:13px;margin-bottom:4px">${hub.name}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:8px">${hub.city}</div>
            <div style="font-size:12px;display:flex;justify-content:space-between;margin-bottom:3px">
              <span style="color:#64748b">Status</span>
              <span style="color:${color};font-weight:600">${hub.active !== false ? 'Active' : 'Inactive'}</span>
            </div>
            <div style="font-size:12px;display:flex;justify-content:space-between">
              <span style="color:#64748b">Manager</span>
              <span style="font-weight:600">${mgr ? mgr.name : 'Unassigned'}</span>
            </div>
          </div>
        `, { maxWidth: 220 });
    });

    instanceRef.current = map;
  }, [open]);

  // Invalidate size when modal opens (fixes grey tiles)
  useEffect(() => {
    if (open && instanceRef.current) {
      setTimeout(() => instanceRef.current.invalidateSize(), 100);
    }
  }, [open]);

  const toggleLines = () => {
    const map = instanceRef.current;
    if (!map) return;
    if (showLines) {
      linesRef.current.forEach(l => map.removeLayer(l));
      linesRef.current = [];
    } else {
      hubs.forEach((h1, i) => hubs.slice(i + 1).forEach(h2 => {
        const lat1 = h1.lat ?? h1.latitude, lng1 = h1.lng ?? h1.longitude;
        const lat2 = h2.lat ?? h2.latitude, lng2 = h2.lng ?? h2.longitude;
        const dist = Math.sqrt((lat1-lat2)**2 + (lng1-lng2)**2);
        if (dist < 12) {
          linesRef.current.push(
            L.polyline([[lat1,lng1],[lat2,lng2]], {
              color: '#1D9E75', weight: 1.5, opacity: 0.35, dashArray: '4 4',
            }).addTo(map)
          );
        }
      }));
    }
    setShowLines(p => !p);
  };

  if (!open) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
    >
      <div style={{ background:'#fff', borderRadius:12, width:'min(860px,95vw)', overflow:'hidden', border:'1px solid #e2e8f0' }}>
        
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>Hub network map</div>
            <div style={{ fontSize:12, color:'#64748b' }}>
              {hubs.length} hubs — {hubs.filter(h => h.active !== false).length} active
            </div>
          </div>
          <button onClick={onClose} style={{ border:'1px solid #e2e8f0', borderRadius:8, width:28, height:28, cursor:'pointer', background:'#fff', fontSize:16 }}>✕</button>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ height: 440 }} />

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'10px 18px', borderTop:'1px solid #e2e8f0', fontSize:12, color:'#64748b' }}>
          {[['#1D9E75','Active'],['#94a3b8','Inactive'],['#f97316','No manager']].map(([c,l]) => (
            <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
            </span>
          ))}
          <button onClick={toggleLines} style={{ marginLeft:'auto', fontSize:12, padding:'5px 12px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff' }}>
            {showLines ? 'Hide connections' : 'Show connections'}
          </button>
        </div>
      </div>
    </div>
  );
}