import React, { useEffect, useRef } from 'react';

let _L = null;
const getL = () => {
  if (_L) return Promise.resolve(_L);
  return new Promise((resolve) => {
    if (window.L) { _L = window.L; resolve(_L); return; }
    const check = setInterval(() => {
      if (window.L) { clearInterval(check); _L = window.L; resolve(_L); }
    }, 100);
  });
};

export default function HubRouteMap({ routeHubs = [], height = 400 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const containerId = useRef('map-' + Math.random().toString(36).slice(2));

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const L = await getL();
      if (cancelled || !mapRef.current) return;
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const hubIcon = (color) => L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
        iconSize: [12, 12], iconAnchor: [6, 6], className: '',
      });

      // Sort by stepOrder to guarantee correct sequence
      const sorted = [...routeHubs].sort((a, b) => a.stepOrder - b.stepOrder);

      const points = [];

      sorted.forEach((hub, i) => {
        // Directly use lat/lng from API response — no lookup needed
        const lat = hub.lat ?? hub.hubLat;
        const lng = hub.lng ?? hub.hubLng;
        const displayName = hub.name || hub.hubName || hub.city || hub.hubCity || `Hub ${hub.id}`;

        if (!lat || !lng) {
          console.warn(`Missing coordinates for hub: "${displayName}" — skipping`);
          return;
        }

        points.push([lat, lng]);

        const isFirst = i === 0;
        const isLast  = i === sorted.length - 1;
        const color   = isFirst ? '#1d4ed8' : isLast ? '#16a34a' : '#f59e0b';

        L.marker([lat, lng], { icon: hubIcon(color) })
          .addTo(map)
          .bindPopup(`
            <strong>${displayName}</strong><br/>
            ${hub.city || hub.hubCity || ''}<br/>
            Step ${hub.stepOrder + 1} — ${hub.status}
          `);
      });

      // Draw route line through ALL hubs in order
      if (points.length > 1) {
        L.polyline(points, {
          color: '#1d4ed8',
          weight: 2.5,
          opacity: 0.6,
          dashArray: '6 4'
        }).addTo(map);
      }

      if (points.length === 1) map.setView(points[0], 8);
      else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [30, 30] });
      else map.setView([20.5937, 78.9629], 5);
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };

  }, [routeHubs]); // full array dependency — re-renders when data changes

  return (
    <div
      ref={mapRef}
      id={containerId.current}
      style={{ height, borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}
    />
  );
}