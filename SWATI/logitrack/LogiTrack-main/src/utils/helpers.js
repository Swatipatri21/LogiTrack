import { INDIA_HUBS } from './constants';

export const fmt = (dt) => {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return dt; }
};

export const fmtDate = (dt) => {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return dt; }
};

export const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export const findNearestHub = (lat, lng, hubs = INDIA_HUBS) =>
  hubs.filter(h => h.active).reduce((c, h) =>
    haversine(lat, lng, h.lat, h.lng) < haversine(lat, lng, c.lat, c.lng) ? h : c
  );

export const buildHubRoute = (originHub, destHub, allHubs = INDIA_HUBS) => {
  if (originHub.id === destHub.id) return [originHub];
  const minLat = Math.min(originHub.lat, destHub.lat) - 1.5, maxLat = Math.max(originHub.lat, destHub.lat) + 1.5;
  const minLng = Math.min(originHub.lng, destHub.lng) - 1.5, maxLng = Math.max(originHub.lng, destHub.lng) + 1.5;
  const intermediates = allHubs
    .filter(h => h.active && h.id !== originHub.id && h.id !== destHub.id && h.lat >= minLat && h.lat <= maxLat && h.lng >= minLng && h.lng <= maxLng)
    .sort((a, b) => haversine(originHub.lat, originHub.lng, a.lat, a.lng) - haversine(originHub.lat, originHub.lng, b.lat, b.lng));
  return [originHub, ...intermediates, destHub];
};

export const downloadCSV = (rows, filename = 'export.csv') => {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
};
