import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, CardHeader, Table, RoleBadge, Spinner } from '../../ui';
import { userAPI, hubAPI } from '../../../services/api';
import { fmtDate } from '../../../utils/helpers';

export default function HubDetails() {
  const [users,         setUsers]         = useState([]);
  const [hubs,          setHubs]          = useState([]);
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');

  useEffect(() => {
    Promise.all([hubAPI.getAll(), userAPI.getAll()])
      .then(([hubRes, userRes]) => {
        setHubs(hubRes.data?.data || hubRes.data || []);
        setUsers(userRes.data?.data || userRes.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hubMap = {};
  hubs.forEach(hub => {
    hubMap[hub.id] = {
      hub: { id: hub.id, name: hub.name || `Hub ${hub.id}`, city: hub.city || 'Unknown' },
      managers: [],
      staff: [],
    };
  });
  users.forEach(u => {
    const hubId = u.hubId || u.hub?.id;
    if (!hubId || !hubMap[hubId]) return;
    if (u.role === 'HUB_MANAGER') hubMap[hubId].managers.push(u);
    if (u.role === 'STAFF')       hubMap[hubId].staff.push(u);
  });

  // Alphabetical + filtered
  const hubGroups = Object.values(hubMap)
    .sort((a, b) => a.hub.name.localeCompare(b.hub.name))
    .filter(g =>
      !search.trim() ||
      g.hub.name.toLowerCase().includes(search.toLowerCase()) ||
      g.hub.city.toLowerCase().includes(search.toLowerCase())
    );

  const selected = Object.values(hubMap).find(g => g.hub.id === selectedHubId);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <Spinner size={32} color="#10b981" />
    </div>
  );

  return (
    <div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hub-row { transition: background .15s, border-left-color .15s; }
        .hub-row:hover { background: #f0fdf9 !important; }
        .hub-search:focus { outline: none; border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,.12); }
        .detail-panel { animation: fadeInUp .22s ease; }
        .stat-tile { transition: transform .15s, box-shadow .15s; }
        .stat-tile:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(16,185,129,.12); }
        .person-row { transition: background .12s; }
        .person-row:hover { background: #f0fdf9 !important; }
      `}</style>

      <SectionHeader
        title="Hub Details"
        subtitle="Personnel assignments across the delivery network"
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedHubId ? '300px 1fr' : '300px 1fr',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* ── LEFT: Hub List ── */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #d1fae5',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(16,185,129,.06)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #065f46, #047857)',
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '.02em', marginBottom: 12 }}>
              🏭 All Hubs
              <span style={{
                marginLeft: 8, fontSize: 11, fontWeight: 700,
                background: 'rgba(255,255,255,.2)', color: '#fff',
                padding: '2px 8px', borderRadius: 20,
              }}>
                {hubGroups.length}
              </span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, pointerEvents: 'none', opacity: .7,
              }}>🔍</span>
              <input
                className="hub-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search hub or city..."
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  borderRadius: 8,
                  border: '1.5px solid rgba(255,255,255,.3)',
                  background: 'rgba(255,255,255,.15)',
                  color: '#fff',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(4px)',
                  transition: 'border .15s, box-shadow .15s',
                }}
              />
            </div>
          </div>

          {/* Hub Rows */}
          <div style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            {hubGroups.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#4b7063', fontSize: 13 }}>
                No hubs match "{search}"
              </div>
            ) : hubGroups.map((g, i) => {
              const isActive = selectedHubId === g.hub.id;
              const hasManager = g.managers.length > 0;
              return (
                <div
                  key={g.hub.id}
                  className="hub-row"
                  onClick={() => setSelectedHubId(g.hub.id)}
                  style={{
                    padding: '13px 18px',
                    borderBottom: '1px solid #f0fdf9',
                    cursor: 'pointer',
                    background: isActive ? '#ecfdf5' : '#fff',
                    borderLeft: `4px solid ${isActive ? '#10b981' : 'transparent'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    {/* Alphabetical index hint */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 6, fontSize: 10, fontWeight: 900,
                        background: isActive ? '#10b981' : '#f0fdf9',
                        color: isActive ? '#fff' : '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #d1fae5',
                      }}>
                        {g.hub.name[0]?.toUpperCase()}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0f2b22', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {g.hub.name}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#4b7063', marginLeft: 26 }}>
                      📍 {g.hub.city}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span style={{
                        fontSize: 10, background: hasManager ? '#ecfeff' : '#fff1f2',
                        color: hasManager ? '#0e7490' : '#be123c',
                        padding: '2px 7px', borderRadius: 10, fontWeight: 700,
                        border: `1px solid ${hasManager ? '#a5f3fc' : '#fecdd3'}`,
                      }}>
                        {g.managers.length}M
                      </span>
                      <span style={{
                        fontSize: 10, background: '#ecfdf5', color: '#065f46',
                        padding: '2px 7px', borderRadius: 10, fontWeight: 700,
                        border: '1px solid #a7f3d0',
                      }}>
                        {g.staff.length}S
                      </span>
                    </div>
                    {!hasManager && (
                      <span style={{ fontSize: 9, color: '#be123c', fontWeight: 700 }}>⚠ No manager</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Detail Panel ── */}
        {selected ? (
          <div className="detail-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Hub Hero */}
            <div style={{
              background: 'linear-gradient(135deg, #065f46 0%, #047857 60%, #0d9488 100%)',
              borderRadius: 14,
              padding: '22px 26px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* decorative circle */}
              <div style={{
                position: 'absolute', right: -30, top: -30,
                width: 140, height: 140, borderRadius: '50%',
                background: 'rgba(255,255,255,.06)',
              }} />
              <div style={{
                position: 'absolute', right: 30, bottom: -40,
                width: 100, height: 100, borderRadius: '50%',
                background: 'rgba(255,255,255,.04)',
              }} />

              <div style={{ fontSize: 11, fontWeight: 800, opacity: .7, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Hub Overview
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.5px', marginBottom: 4 }}>
                {selected.hub.name}
              </div>
              <div style={{ fontSize: 13, opacity: .8, marginBottom: 20 }}>
                📍 {selected.hub.city}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'City',         value: selected.hub.city,           icon: '🌆' },
                  { label: 'Managers',     value: selected.managers.length,    icon: '👔' },
                  { label: 'Staff',        value: selected.staff.length,       icon: '👷' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="stat-tile" style={{
                    background: 'rgba(255,255,255,.12)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    border: '1px solid rgba(255,255,255,.15)',
                    cursor: 'default',
                  }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{value}</div>
                    <div style={{ fontSize: 10, opacity: .75, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Team */}
            <div style={{
              background: '#fff', borderRadius: 14,
              border: '1px solid #d1fae5',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(16,185,129,.06)',
            }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f0fdf9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f2b22' }}>👔 Management Team</div>
                  <div style={{ fontSize: 11, color: '#4b7063', marginTop: 2 }}>{selected.managers.length} manager{selected.managers.length !== 1 ? 's' : ''} assigned</div>
                </div>
              </div>

              {selected.managers.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
                  <div style={{ fontSize: 13, color: '#be123c', fontWeight: 700 }}>No manager assigned</div>
                  <div style={{ fontSize: 12, color: '#4b7063', marginTop: 4 }}>Assign a manager from Hub Network</div>
                </div>
              ) : (
                <div>
                  {selected.managers.map((u, i) => (
                    <div key={u.id} className="person-row" style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 20px',
                      borderBottom: i < selected.managers.length - 1 ? '1px solid #f0fdf9' : 'none',
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, #0d9488, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 900, color: '#fff',
                      }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f2b22' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#4b7063', marginTop: 1 }}>{u.email}</div>
                      </div>
                      <RoleBadge role={u.role} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operational Staff */}
            <div style={{
              background: '#fff', borderRadius: 14,
              border: '1px solid #d1fae5',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(16,185,129,.06)',
            }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f0fdf9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f2b22' }}>👷 Operational Staff</div>
                  <div style={{ fontSize: 11, color: '#4b7063', marginTop: 2 }}>{selected.staff.length} staff member{selected.staff.length !== 1 ? 's' : ''} assigned</div>
                </div>
              </div>

              {selected.staff.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
                  <div style={{ fontSize: 13, color: '#4b7063', fontWeight: 600 }}>No staff assigned yet</div>
                </div>
              ) : (
                <div>
                  {selected.staff
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((u, i) => (
                    <div key={u.id} className="person-row" style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 20px',
                      borderBottom: i < selected.staff.length - 1 ? '1px solid #f0fdf9' : 'none',
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, #10b981, #047857)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 900, color: '#fff',
                      }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f2b22' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#4b7063', marginTop: 1 }}>{u.email}</div>
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 600 }}>Joined</div>
                        <div>{fmtDate(u.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div style={{
            height: '340px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            border: '2px dashed #a7f3d0',
            borderRadius: 14,
            color: '#4b7063',
            background: 'linear-gradient(135deg, #f0fdf9, #ecfeff)',
          }}>
            <div style={{ fontSize: 42, marginBottom: 14 }}>🏭</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46', marginBottom: 6 }}>Select a hub</div>
            <div style={{ fontSize: 12, color: '#4b7063' }}>Click any hub on the left to view assigned personnel</div>
          </div>
        )}
      </div>
    </div>
  );
}