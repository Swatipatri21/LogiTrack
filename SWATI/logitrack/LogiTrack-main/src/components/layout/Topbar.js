import React from 'react';

export default function Topbar({ title, user }) {
  return (
    <header style={{
      height: 58, background: '#fff',
      borderBottom: '1px solid #d1fae5',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 2px 8px rgba(16,185,129,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 20, background: 'linear-gradient(180deg, #10b981, #059669)', borderRadius: 2 }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f2b22' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 12, color: '#4b7063', background: '#ecfdf5', padding: '4px 12px', borderRadius: 20, border: '1px solid #a7f3d0', fontWeight: 600 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
