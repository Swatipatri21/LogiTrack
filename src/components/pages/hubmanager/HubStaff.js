import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, Table, RoleBadge, Button, Modal, Input, Alert, Spinner } from '../../ui';
import { userAPI, authAPI } from '../../../services/api';
import { fmtDate } from '../../../utils/helpers';

export default function HubStaff({ user }) {
  const [staff,         setStaff]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showAdd,       setShowAdd]       = useState(false);
  const [form,          setForm]          = useState({});
  const [formAlert,     setFormAlert]     = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError,   setDeleteError]   = useState(null);
  const [deleting,      setDeleting]      = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getStaffByHub(user.hubId);
      setStaff(res.data?.data || res.data || []);
    } catch {
      try {
        const all = await userAPI.getAll();
        const users = all.data?.data || all.data || [];
        setStaff(users.filter(u => u.role === 'STAFF' && (u.hubId === user.hubId || u.hub?.id === user.hubId)));
      } catch { setStaff([]); }
    }
    setLoading(false);
  };

  useEffect(() => { loadStaff(); }, [user.hubId]);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const addStaff = async () => {
    if (!form.name || !form.email || !form.password) { setFormAlert('All fields are required.'); return; }
    setSaving(true); setFormAlert(null);
    try {
      const regRes = await authAPI.register({ name: form.name, email: form.email, password: form.password, role: 'STAFF', hubId: user.hubId });
      const newUser = regRes.data?.data || regRes.data;
      const newUserId = newUser?.id;
      if (newUserId && user.hubId) {
        try { await userAPI.assignToHub(newUserId, user.hubId); } catch {}
      }
      await loadStaff();
      setShowAdd(false); setForm({});
    } catch (err) { setFormAlert(err?.response?.data?.message || 'Registration failed. Email may already exist.'); }
    setSaving(false);
  };

  const removeStaff = async (u) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await userAPI.deleteUser(u.id);
      setDeleteConfirm(null);
      // Reload from server to confirm deletion persisted
      await loadStaff();
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteError(err?.response?.data?.message || 'Failed to remove staff. Please try again.');
      setDeleting(false);
    }
    setDeleting(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><Spinner size={28} color="#10b981" /></div>;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,#065f46,#047857)', borderRadius: 12, padding: '14px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
        <div style={{ fontSize: 28 }}>👥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{user.hubName} — Staff</div>
          <div style={{ fontSize: 11, opacity: .75, marginTop: 2 }}>Only staff assigned to your hub</div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900 }}>{staff.length}</div>
      </div>

      <SectionHeader title="My Staff" subtitle={`${staff.length} staff member${staff.length !== 1 ? 's' : ''} at ${user.hubName}`}
        action={<Button variant="primary" onClick={() => { setShowAdd(true); setForm({}); setFormAlert(null); }}>+ Add Staff</Button>} />

      <Card>
        {staff.length === 0
          ? <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4b7063' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e4035' }}>No staff yet</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Add staff who will process shipments at your hub</div>
              <div style={{ marginTop: 16 }}><Button variant="primary" onClick={() => setShowAdd(true)}>+ Add First Staff Member</Button></div>
            </div>
          : <Table columns={[
              { label: 'Name', render: u => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>{u.name?.[0]?.toUpperCase()}</div>
                  <div><div style={{ fontWeight: 700, color: '#0f2b22' }}>{u.name}</div><div style={{ fontSize: 11, color: '#4b7063' }}>{u.email}</div></div>
                </div>
              )},
              { label: 'Role',    render: u => <RoleBadge role={u.role} /> },
              { label: 'Hub',     render: u => <span style={{ fontSize: 12 }}>{u.hubName || user.hubName}</span> },
              { label: 'Joined',  render: u => <span style={{ fontSize: 12, color: '#4b7063' }}>{fmtDate(u.createdAt)}</span> },
              { label: 'Actions', render: u => (
                // Hide Remove button for HUB_MANAGER role
                u.role === 'HUB_MANAGER' ? (
                  <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>Manager</span>
                ) : (
                  <Button variant="danger" size="xs" onClick={() => { setDeleteError(null); setDeleteConfirm(u); }}>
                    Remove
                  </Button>
                )
              )},
            ]} rows={staff} />}
      </Card>

      {/* Add Staff Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setForm({}); setFormAlert(null); }} title="Add Staff Member" width={440}
        footer={<><Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button><Button variant="primary" onClick={addStaff} disabled={saving}>{saving ? 'Adding...' : '+ Add Staff'}</Button></>}>
        {formAlert && <div style={{ marginBottom: 12 }}><Alert message={formAlert} type="danger" /></div>}
        <div style={{ padding: '10px 13px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: 12, color: '#065f46', marginBottom: 14 }}>
          🏭 Will be assigned to: <strong>{user.hubName}</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Full Name *" value={form.name || ''} onChange={f('name')} placeholder="Suresh Patel" />
          <Input label="Email *" value={form.email || ''} onChange={f('email')} type="email" placeholder="suresh@logitrack.com" />
          <Input label="Password *" value={form.password || ''} onChange={f('password')} type="password" placeholder="Min 6 characters" />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => { setDeleteConfirm(null); setDeleteError(null); }} title="Remove Staff Member" width={380}
        footer={<>
          <Button variant="ghost" onClick={() => { setDeleteConfirm(null); setDeleteError(null); }} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={() => removeStaff(deleteConfirm)} disabled={deleting}>
            {deleting ? 'Removing...' : 'Remove'}
          </Button>
        </>}>
        <div style={{ fontSize: 14, color: '#374151' }}>
          Remove <strong>{deleteConfirm?.name}</strong> from {user.hubName}?
          <div style={{ fontSize: 12, color: '#4b7063', marginTop: 8 }}>This will revoke their access to hub tasks.</div>
        </div>
        {deleteError && (
          <div style={{ marginTop: 12 }}>
            <Alert message={deleteError} type="danger" />
          </div>
        )}
      </Modal>
    </div>
  );
}