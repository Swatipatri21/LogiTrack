import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/layout/AppShell';

// Public
// import LandingPage from './components/pages/public/LandingPage';
import Login from './components/pages/public/Login';
import Signup from './components/pages/public/Signup';
import PublicTracking from './components/pages/public/PublicTracking';

// Admin
import Dashboard from './components/pages/admin/Dashboard';
import Shipments from './components/pages/admin/Shipments';
import Hubs from './components/pages/admin/Hubs';
import HubDetails from './components/pages/admin/HubDetails';
import History from './components/pages/admin/History';
import Analytics from './components/pages/admin/Analytics';


// Hub Manager
import HubDashboard from './components/pages/hubmanager/HubDashboard';
import HubStaff from './components/pages/hubmanager/HubStaff';
import HubHistory from './components/pages/hubmanager/HubHistory';
import ReportDelay from './components/pages/hubmanager/ReportDelay';
import RescheduleDelivery from './components/pages/hubmanager/RescheduleDelivery';

// Staff
import StaffTasks from './components/pages/staff/StaffTasks';
import ConfirmDelivery from './components/pages/staff/ConfirmDelivery';

import ShipmentDetailModal from './components/ShipmentDetailModal';
import { shipmentAPI } from './services/api';
// import PublicTracking from './components/pages/public/PublicTracking';

const DEFAULT_PAGE = { ADMIN: 'dashboard', HUB_MANAGER: 'hub-dashboard', STAFF: 'staff-tasks' };

export default function App() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  // 'landing' | 'login' | 'signup' | 'public' | 'app'
  const [view, setView] = useState('landing');
  const [shipments, setShipments] = useState([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  useEffect(() => {
    if (user) { setView('app'); }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    setShipmentsLoading(true);
    shipmentAPI.getAll()
      .then(res => setShipments(res.data?.data || res.data || []))
      .catch(() => setShipments([]))
      .finally(() => setShipmentsLoading(false));
  }, [user]);

  const handleLogin = useCallback(async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      setView('app');
      navigate(`/${DEFAULT_PAGE[result.user.role] || 'dashboard'}`);
    }
    return result;
  }, [login, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    setView('landing');
    setShipments([]);
    navigate('/');
  }, [logout, navigate]);

  const viewShipment = useCallback((s) => setSelectedShipment(s), []);

  // ── Public views ──────────────────────────────────────
  // if (view === 'landing') return <LandingPage onLogin={() => setView('login')} onSignup={() => setView('signup')} />;
//  if (view === 'landing') return <PublicTracking onBack={() => setView('login')} onLoginSuccess={() => setView('login')} 
  // if(view === 'landing') return <PublicTracking onBack={() => setView('login')} onLoginSuccess={() => setView('login')} onSignup={() => setView('signup')} />;
  if (view === 'landing')
  return (
    <PublicTracking
      onLogin={() => setView('login')}
    />
  );
// if (view === 'signup')  return <Signup onBack={() => setView('login')} onLoginSuccess={() => setView('login')} />;
  if (view === 'login' || !user) return <Login onLogin={handleLogin} onBack={() => setView('landing')} onSignup={() => setView('signup')} />;
  // if (view === 'public')  return <PublicTracking onLogin={() => setView('login')} />;

  // ── Authenticated app ─────────────────────────────────
  const wrap = (Component, extraProps = {}) => (
    <AppShell user={user} onLogout={handleLogout}>
      <Component {...extraProps} />
    </AppShell>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={`/${DEFAULT_PAGE[user.role] || 'dashboard'}`} replace />} />

        {/* Admin */}
        <Route path="/dashboard"    element={wrap(Dashboard, { shipments, loading: shipmentsLoading, onViewShipment: viewShipment })} />
        <Route path="/shipments"    element={wrap(Shipments, { shipments, setShipments, role: user.role, onViewShipment: viewShipment })} />
        <Route path="/hubs"         element={wrap(Hubs)} />
        <Route path="/users"        element={wrap(HubDetails)} />
        <Route path="/history"      element={wrap(History)} />
        <Route path="/analytics"    element={wrap(Analytics, { shipments })} />
        {/* <Route path="/sla-reports"  element={wrap(SLAReports, { shipments })} /> */}
        {/* <Route path="/user-management" element={wrap(UserManagement)} /> */}
        {/* <Route path="/notifications"   element={wrap(NotificationCenter)} /> */}

        {/* Hub Manager */}
        <Route path="/hub-dashboard"  element={wrap(HubDashboard, { user, onViewShipment: viewShipment })} />
        {/* <Route path="/hub-shipments"  element={wrap(Shipments, { shipments, setShipments, role: user.role, onViewShipment: viewShipment })} /> */}
        <Route path="/hub-staff"      element={wrap(HubStaff, { user })} />
        <Route path="/hub-delays"     element={wrap(ReportDelay)} />
        <Route path="/hub-history"    element={wrap(HubHistory, { user })} />
        <Route path="/reschedule-mgr" element={wrap(RescheduleDelivery, { role: user.role })} />
 {/* <Route path="/hub-dashboard/*" element={
          user?.role === 'HUB_MANAGER' 
            ? <HubManagerPortal user={user} onViewShipment={setSelectedShipment} /> 
            : <Navigate to="/login" />
        } />
        
        <Route path="/staff-tasks/*" element={
          user?.role === 'STAFF' 
            ? <StaffPortal user={user} onViewShipment={setSelectedShipment} /> 
            : <Navigate to="/login" />
        } /> */}

        {/* Staff */}
        <Route path="/staff-tasks"     element={wrap(StaffTasks, { user })} />
        <Route path="/otp"             element={wrap(ConfirmDelivery)} />
        <Route path="/reschedule-staff" element={wrap(RescheduleDelivery, { role: user.role })} />

        <Route path="*" element={<Navigate to={`/${DEFAULT_PAGE[user.role] || 'dashboard'}`} replace />} />
      </Routes>

      <ShipmentDetailModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />
    </>
  );
}
