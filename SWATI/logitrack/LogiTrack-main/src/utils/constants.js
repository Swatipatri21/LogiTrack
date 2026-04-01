export const API_BASE = process.env.REACT_APP_API_BASE_URL 
  ? `${process.env.REACT_APP_API_BASE_URL}/api`
  : 'http://localhost:8080/api';

export const INDIA_HUBS = [
  { id: 1,  name: 'Mumbai Hub',        city: 'Mumbai',        state: 'Maharashtra',    lat: 19.0760, lng: 72.8777, active: true },
  { id: 2,  name: 'Delhi Hub',         city: 'New Delhi',     state: 'Delhi',          lat: 28.6139, lng: 77.2090, active: true },
  { id: 3,  name: 'Bengaluru Hub',     city: 'Bengaluru',     state: 'Karnataka',      lat: 12.9716, lng: 77.5946, active: true },
  { id: 4,  name: 'Chennai Hub',       city: 'Chennai',       state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707, active: true },
  { id: 5,  name: 'Kolkata Hub',       city: 'Kolkata',       state: 'West Bengal',    lat: 22.5726, lng: 88.3639, active: true },
  { id: 6,  name: 'Hyderabad Hub',     city: 'Hyderabad',     state: 'Telangana',      lat: 17.3850, lng: 78.4867, active: true },
  { id: 7,  name: 'Pune Hub',          city: 'Pune',          state: 'Maharashtra',    lat: 18.5204, lng: 73.8567, active: true },
  { id: 8,  name: 'Ahmedabad Hub',     city: 'Ahmedabad',     state: 'Gujarat',        lat: 23.0225, lng: 72.5714, active: true },
  { id: 9,  name: 'Jaipur Hub',        city: 'Jaipur',        state: 'Rajasthan',      lat: 26.9124, lng: 75.7873, active: true },
  { id: 10, name: 'Lucknow Hub',       city: 'Lucknow',       state: 'Uttar Pradesh',  lat: 26.8467, lng: 80.9462, active: true },
  { id: 11, name: 'Nagpur Hub',        city: 'Nagpur',        state: 'Maharashtra',    lat: 21.1458, lng: 79.0882, active: true },
  { id: 12, name: 'Indore Hub',        city: 'Indore',        state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, active: true },
  { id: 13, name: 'Chandigarh Hub',    city: 'Chandigarh',    state: 'Punjab',         lat: 30.7333, lng: 76.7794, active: true },
  { id: 14, name: 'Ludhiana Hub',      city: 'Ludhiana',      state: 'Punjab',         lat: 30.9010, lng: 75.8573, active: true },
  { id: 15, name: 'Kochi Hub',         city: 'Kochi',         state: 'Kerala',         lat: 9.9312,  lng: 76.2673, active: true },
];

export const STATUS_CONFIG = {
  CREATED:            { label: 'Created',          color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  DISPATCHED:         { label: 'Dispatched',        color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  IN_TRANSIT:         { label: 'In Transit',        color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  OUT_FOR_DELIVERY:   { label: 'Out for Delivery',  color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  DELIVERED:          { label: 'Delivered',         color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  DELIVERY_ATTEMPTED: { label: 'Attempt Failed',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  FAILED:             { label: 'Failed',            color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  RETURNED_TO_SENDER: { label: 'Returned',          color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  PENDING:            { label: 'Pending',           color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  ARRIVED:            { label: 'Arrived',           color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  LOCKED:             { label: 'Locked',            color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
};

export const ROLE_CONFIG = {
  ADMIN:       { label: 'Admin',       color: '#7c3aed', bg: '#f5f3ff' },
  HUB_MANAGER: { label: 'Hub Manager', color: '#0369a1', bg: '#f0f9ff' },
  STAFF:       { label: 'Staff',       color: '#16a34a', bg: '#f0fdf4' },
  CUSTOMER:    { label: 'Customer',    color: '#d97706', bg: '#fffbeb' },
};

export const DEMO_CREDENTIALS = {
  // 'admin@logitrack.com':      { password: 'admin123', name: 'Admin User',           role: 'ADMIN',       hubId: null, hubName: null },
  // 'hub.pune@logitrack.com':   { password: 'hub123',   name: 'Hub Manager — Pune',   role: 'HUB_MANAGER', hubId: 7,   hubName: 'Pune Hub' },
  // 'hub.mumbai@logitrack.com': { password: 'hub123',   name: 'Hub Manager — Mumbai', role: 'HUB_MANAGER', hubId: 1,   hubName: 'Mumbai Hub' },
  // 'staff@logitrack.com':      { password: 'staff123', name: 'Staff Member',         role: 'STAFF',       hubId: 7,   hubName: 'Pune Hub' },
};
