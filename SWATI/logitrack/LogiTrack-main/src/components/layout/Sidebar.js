import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ADMIN_NAV = [
  { id: 'dashboard',   label: 'Dashboard',       icon: '◈', section: 'Overview' },
  { id: 'shipments',   label: 'Shipments',        icon: '📦', section: 'Operations' },
  { id: 'hubs',        label: 'Hub Network',      icon: '🗺' },
  { id: 'users',       label: 'Hub Details',      icon: '🏭' },
  { id: 'analytics',   label: 'Analytics',        icon: '📊', section: 'Reports' },
  { id: 'history',     label: 'Audit History',    icon: '📋' },
  // { id: 'sla-reports', label: 'SLA Reports',      icon: '📈' },
  // { id: 'user-management', label: 'Users',        icon: '👥', section: 'Admin' },
  // { id: 'notifications', label: 'Notifications',  icon: '🔔' },
];

const HUB_NAV = [
  { id: 'hub-dashboard', label: 'Dashboard',        icon: '◈',  section: 'Overview' },
  // { id: 'hub-shipments', label: 'Hub Shipments',    icon: '📦', section: 'Operations' },
  { id: 'staff-tasks',   label: 'Hub Tasks',        icon: '📋' },
  { id: 'hub-staff',     label: 'My Staff',         icon: '👥' },
  { id: 'hub-delays',    label: 'Report Delay',     icon: '⚠️' },
  { id: 'reschedule-mgr',label: 'Reschedule',       icon: '📅' },
  { id: 'otp',           label: 'Confirm OTP',      icon: '✅' },
  { id: 'hub-history',   label: 'Hub History',      icon: '🗂', section: 'Reports' },
];

const STAFF_NAV = [
  { id: 'staff-tasks',    label: 'My Tasks',         icon: '📋', section: 'Work' },
  { id: 'otp',            label: 'Confirm Delivery', icon: '✅' },
  { id: 'reschedule-staff',label: 'Reschedule',      icon: '📅' },
];

function RoleBadge({ role }) {
  const cfg = {
    ADMIN:       { label: 'Admin',       bg: 'rgba(16,185,129,0.25)', color: '#ffffff', border: '1px solid rgba(16,185,129,0.4)' },
    HUB_MANAGER: { label: 'Hub Manager', bg: 'rgba(6,182,212,0.25)',  color: '#ffffff', border: '1px solid rgba(6,182,212,0.4)' },
    STAFF:       { label: 'Staff',       bg: 'rgba(34,197,94,0.25)',  color: '#ffffff', border: '1px solid rgba(34,197,94,0.4)' },
  }[role] || { label: role, bg: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)' };
  
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.6px',
      padding: '5px 12px',
      borderRadius: 24,
      background: cfg.bg,
      color: cfg.color,
      border: cfg.border,
      display: 'inline-block',
      backdropFilter: 'blur(4px)',
    }}>
      {cfg.label}
    </span>
  );
}

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const items = user.role === 'ADMIN' ? ADMIN_NAV : user.role === 'HUB_MANAGER' ? HUB_NAV : STAFF_NAV;

  return (
    <>
      <style>{`
        .lt-nav-link { 
          text-decoration: none !important;
          display: block;
        }
        .lt-nav-item {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .lt-nav-item::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          width: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-50%);
          transition: width 0.25s ease;
          border-radius: 8px;
          z-index: 0;
        }
        .lt-nav-item:hover::before {
          width: 100%;
        }
        .lt-nav-item:hover:not(.active) { 
          color: #ffffff !important;
          transform: translateX(4px);
        }
        .lt-nav-item.active { 
          background: linear-gradient(90deg, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.1) 100%) !important;
          color: #ffffff !important;
          border-left: 3px solid #10b981 !important;
          box-shadow: 0 2px 12px rgba(16,185,129,0.2);
        }
        .lt-nav-item.active .nav-icon {
          filter: drop-shadow(0 0 6px rgba(16,185,129,0.6));
        }
        .lt-logout-btn:hover {
          background: rgba(239,68,68,0.2) !important;
          color: #ffffff !important;
          border-color: #ef4444 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239,68,68,0.25);
        }
        .lt-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .lt-sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .lt-sidebar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #10b981, #059669);
          border-radius: 10px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .active-dot {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <aside style={{
        width: 300,
        minHeight: '100vh',
   height: '100vh',        // ADD THIS
  overflow: 'hidden',     // ADD THIS 
        background: 'linear-gradient(180deg, #0a2a1a 0%, #0a2f1f 50%, #062012 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        boxShadow: '8px 0 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Logo Section - Enhanced with white text */}
        <div style={{ 
          padding: '32px 24px 24px', 
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0) 100%)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
              transition: 'transform 0.3s ease',
            }}>
              🚚
            </div>
            <div>
              <div style={{ 
                fontWeight: 900, 
                fontSize: 24, 
                color: '#ffffff',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}>
                LogiTrack
              </div>
              <div style={{ 
                fontSize: 11, 
                color: '#d1fae5', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '1.5px',
                marginTop: 2,
                opacity: 0.9,
              }}>
                Enterprise Platform
              </div>
            </div>
          </div>
        </div>

        {/* Hub Badge - Enhanced with white text */}
        {user.hubName && (
          <div style={{ 
            margin: '20px 16px 0', 
            padding: '16px 18px', 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
            borderRadius: 12, 
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            flexShrink: 0,
          }}>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 800, 
              color: '#d1fae5', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span>📍</span> Active Hub
            </div>
            <div style={{ 
              fontSize: 15, 
              fontWeight: 700, 
              color: '#ffffff',
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              lineHeight: 1.3,
            }}>
              <span style={{ fontSize: 15 }}>🏭</span>
              {user.hubName}
            </div>
          </div>
        )}

        {/* Navigation - Scrollable area */}
        <nav className="lt-sidebar" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '8px 0',
          marginTop: 8,
          minHeight: 0,
        }}>
          {items.map((item, index) => {
            const isNewSection = item.section && (index === 0 || items[index - 1]?.section !== item.section);
            const active = location.pathname === `/${item.id}`;
            return (
              <React.Fragment key={item.id}>
                {isNewSection && (
                  <div style={{ 
                    padding: '24px 20px 8px', 
                    fontSize: 11, 
                    fontWeight: 800, 
                    color: '#d1fae5', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1.2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span>{item.section}</span>
                    <div style={{ 
                      flex: 1, 
                      height: 1.5, 
                      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                      borderRadius: 2,
                    }} />
                  </div>
                )}
                <Link to={`/${item.id}`} className="lt-nav-link">
                  <div className={`lt-nav-item${active ? ' active' : ''}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '13px 20px',
                    margin: '2px 12px',
                    borderRadius: 10,
                    color: active ? '#ffffff' : '#e2e8f0',
                    fontWeight: active ? 700 : 500,
                    fontSize: 15,
                    borderLeft: `3px solid ${active ? '#10b981' : 'transparent'}`,
                    position: 'relative',
                    cursor: 'pointer',
                  }}>
                    <span className="nav-icon" style={{ 
                      fontSize: 20, 
                      width: 26, 
                      textAlign: 'center',
                      filter: active ? 'none' : 'brightness(0.9)',
                      transition: 'filter 0.2s ease',
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && (
                      <div className="active-dot" style={{ 
                        width: 7, 
                        height: 7, 
                        borderRadius: '50%', 
                        background: '#10b981',
                        boxShadow: '0 0 10px rgba(16,185,129,0.8)',
                      }} />
                    )}
                  </div>
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* User Footer - Always visible at bottom */}
        <div style={{ 
          padding: '20px 16px 24px', 
          borderTop: '2px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(0deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)',
          flexShrink: 0,
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 14, 
            padding: '12px 14px', 
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
          }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 19,
              fontWeight: 900,
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: 15, 
                fontWeight: 700, 
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 6,
              }}>
                {user.name}
              </div>
              <RoleBadge role={user.role} />
            </div>
          </div>
          
          <button 
            className="lt-logout-btn" 
            onClick={onLogout} 
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontFamily: 'inherit',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ fontSize: 17 }}>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export { RoleBadge };