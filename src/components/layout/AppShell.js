import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PAGE_TITLES = {
  dashboard: 'Dashboard', shipments: 'Shipments', hubs: 'Hub Network', users: 'Hub Details',
  history: 'Audit History', analytics: 'Analytics Dashboard', 'sla-reports': 'SLA Reports',
  'user-management': 'User Management', notifications: 'Notification Center',
  'hub-dashboard': 'Hub Dashboard', 'hub-shipments': 'Hub Shipments', 'hub-staff': 'My Staff',
  'hub-delays': 'Report Delay', 'hub-history': 'Hub History',
  'reschedule-mgr': 'Reschedule Delivery', 'reschedule-staff': 'Reschedule Delivery',
  'staff-tasks': ' Hub Tasks', otp: 'Confirm Delivery',
};

export default function AppShell({ user, onLogout, children }) {
  const location = useLocation();
  const currentPage = location.pathname.replace('/', '') || 'dashboard';
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0fdf9' }}>
      <Sidebar user={user} currentPage={currentPage} onLogout={onLogout} />
      <div style={{ marginLeft: 300, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar title={PAGE_TITLES[currentPage] || ''} user={user} />
        <main style={{ flex: 1, padding: '24px 26px', maxWidth: 1440, width: '100%' }}>{children}</main>
      </div>
    </div>
  );
}
