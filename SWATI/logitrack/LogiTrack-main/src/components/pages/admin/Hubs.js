import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, CardHeader, Table, Button, Modal, Input, Alert, Spinner } from '../../ui';
import { hubAPI, authAPI, userAPI } from '../../../services/api';
import { INDIA_HUBS } from '../../../utils/constants';
import HubNetworkMap from './HubNetworkMap';

const STEPS = { HUB: 'hub', MANAGER: 'manager', DONE: 'done' };

export default function Hubs() {
  const [hubs, setHubs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wizardStep, setWizardStep] = useState(null);
  const [newHubId, setNewHubId] = useState(null);
  const [newHubName, setNewHubName] = useState('');
  const [hubForm, setHubForm] = useState({});
  const [managerForm, setManagerForm] = useState({ mode: 'new' });
  const [wizardAlert, setWizardAlert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editManagerHub, setEditManagerHub] = useState(null);
  const [editManagerForm, setEditManagerForm] = useState({});
  const [editAlert, setEditAlert] = useState(null);

  const refreshData = async () => {
    try {
      const [hr, ur] = await Promise.allSettled([hubAPI.getAll(), userAPI.getAll()]);
      if (hr.status === 'fulfilled') {
        const raw = hr.value.data?.data || hr.value.data || [];
        setHubs(raw.length > 0 ? raw.map(h => ({ ...h, lat: h.latitude, lng: h.longitude })) : INDIA_HUBS);
      } else { setHubs(INDIA_HUBS); }
      if (ur.status === 'fulfilled') setAllUsers(ur.value.data?.data || ur.value.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const getManager = hubId => allUsers.find(u => u.role === 'HUB_MANAGER' && (u.hubId === hubId || u.hub?.id === hubId));
  const unassigned = allUsers.filter(u => u.role === 'HUB_MANAGER' && !u.hubId && !u.hub?.id);

  const hf = k => e => setHubForm(p => ({ ...p, [k]: e.target.value }));
  const mf = k => e => setManagerForm(p => ({ ...p, [k]: e.target.value }));
  const ef = k => e => setEditManagerForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreateHub = async () => {
    if (!hubForm.name || !hubForm.city) { setWizardAlert({ msg: 'Name and city required.', type: 'danger' }); return; }
    setSaving(true); setWizardAlert(null);
    try {
      const res = await hubAPI.create({ name: hubForm.name, city: hubForm.city, latitude: parseFloat(hubForm.lat) || 0, longitude: parseFloat(hubForm.lng) || 0 });
      const id = res.data?.data?.id || res.data?.id;
      setNewHubId(id); setNewHubName(hubForm.name);
      setHubs(prev => [...prev, { id, name: hubForm.name, city: hubForm.city, lat: parseFloat(hubForm.lat)||0, lng: parseFloat(hubForm.lng)||0, active: true }]);
      setWizardStep(STEPS.MANAGER);
    } catch (err) { setWizardAlert({ msg: err?.response?.data?.message || 'Failed to create hub.', type: 'danger' }); }
    setSaving(false);
  };

  const handleAssignManager = async () => {
    setSaving(true); setWizardAlert(null);
    if (!newHubId) { setWizardAlert({ msg: 'Hub ID missing.', type: 'danger' }); setSaving(false); return; }
    try {
      let userId;
      if (managerForm.mode === 'existing') {
        if (!managerForm.existingUserId) { setWizardAlert({ msg: 'Select a user.', type: 'danger' }); setSaving(false); return; }
        userId = managerForm.existingUserId;
      } else {
        if (!managerForm.name || !managerForm.email || !managerForm.password) { setWizardAlert({ msg: 'All fields required.', type: 'danger' }); setSaving(false); return; }
        const r = await authAPI.register({ name: managerForm.name, email: managerForm.email, password: managerForm.password, role: 'HUB_MANAGER', hubId: newHubId });
        userId = r.data?.data?.id || r.data?.id;
      }
      await hubAPI.assignManager(newHubId, userId);
      await refreshData();
      setWizardStep(STEPS.DONE);
    } catch (err) { setWizardAlert({ msg: err?.response?.data?.message || 'Assignment failed.', type: 'danger' }); }
    setSaving(false);
  };

  const closeWizard = () => { setWizardStep(null); setNewHubId(null); setNewHubName(''); setHubForm({}); setManagerForm({ mode: 'new' }); setWizardAlert(null); };

  const toggleHub = async hub => {
    try { hub.active !== false ? await hubAPI.deactivate(hub.id) : await hubAPI.activate(hub.id); } catch {}
    setHubs(prev => prev.map(h => h.id === hub.id ? { ...h, active: !h.active } : h));
  };

  const openEdit = hub => {
    const mgr = getManager(hub.id);
    setEditManagerHub(hub);
    setEditManagerForm(mgr ? { mode: 'update', name: mgr.name, email: mgr.email, password: '', managerId: mgr.id } : { mode: 'assign', name: '', email: '', password: '' });
    setEditAlert(null);
  };

  // const handleUpdateManager = async () => {
  //   if (!editManagerForm.name || !editManagerForm.email) { setEditAlert({ msg: 'Name and email required.', type: 'danger' }); return; }
  //   setSaving(true); setEditAlert(null);
  //   try {
  //     const regRes = await authAPI.register({ name: editManagerForm.name, email: editManagerForm.email, password: editManagerForm.password || 'temp1234', role: 'HUB_MANAGER' });
  //     const userId = regRes.data?.data?.id || regRes.data?.id;
  //     if (!userId) { setEditAlert({ msg: 'Could not get user ID from response.', type: 'danger' }); setSaving(false); return; }
  //     await hubAPI.assignManager(editManagerHub.id, userId);
  //     await refreshData();
  //     setEditAlert({ msg: 'Manager assigned successfully.', type: 'success' });
  //     setTimeout(() => { setEditManagerHub(null); setEditAlert(null); }, 1500);
  //   } catch (err) { setEditAlert({ msg: err?.response?.data?.message || 'Update failed.', type: 'danger' }); }
  //   setSaving(false);
  // };

  const handleUpdateManager = async () => {
  setSaving(true);
  setEditAlert(null);

  try {
    let userId;

    // Assign existing manager
    if (editManagerForm.mode === "existing") {
      if (!editManagerForm.existingUserId) {
        setEditAlert({ msg: "Please select a manager.", type: "danger" });
        setSaving(false);
        return;
      }

      userId = editManagerForm.existingUserId;
    }

    // Create new manager
    else if (editManagerForm.mode === "new") {
      if (!editManagerForm.name || !editManagerForm.email || !editManagerForm.password) {
        setEditAlert({ msg: "Name, email and password required.", type: "danger" });
        setSaving(false);
        return;
      }

      const regRes = await authAPI.register({
        name: editManagerForm.name,
        email: editManagerForm.email,
        password: editManagerForm.password,
        role: "HUB_MANAGER"
      });

      userId = regRes.data?.data?.id || regRes.data?.id;
    }

    // Update existing manager info
    else if (editManagerForm.mode === "update") {
      if (!editManagerForm.name || !editManagerForm.email) {
        setEditAlert({ msg: "Name and email required.", type: "danger" });
        setSaving(false);
        return;
      }

      await userAPI.updateUser(editManagerForm.managerId, {
        name: editManagerForm.name,
        email: editManagerForm.email,
        password: editManagerForm.password || undefined
      });

      await refreshData();
      setEditManagerHub(null);
      setSaving(false);
      return;
    }

    // Assign manager to hub
    await hubAPI.assignManager(editManagerHub.id, userId);

    await refreshData();

    setEditAlert({
      msg: "Manager assigned successfully.",
      type: "success"
    });

    setTimeout(() => {
      setEditManagerHub(null);
      setEditAlert(null);
    }, 1200);

  } catch (err) {
    setEditAlert({
      msg: err?.response?.data?.message || "Update failed.",
      type: "danger"
    });
  }

  setSaving(false);
};

  // const handleDeleteManager = async () => {
  //   if (!window.confirm('Remove this manager?')) return;
  //   const mgr = getManager(editManagerHub.id);
  //   if (!mgr) return;
  //   try { await userAPI.deleteUser(mgr.id); await refreshData(); setEditManagerHub(null); } catch {}
  // };
  const handleDeleteManager = async () => {
  if (!window.confirm("Deassign this manager from the hub?")) return;

  try {
    await hubAPI.deassignManager(editManagerHub.id);
    await refreshData();
    setEditManagerHub(null);
  } catch (err) {
    console.error("Deassign failed:", err);
  }
};


const displayHubs = (hubs.length > 0 ? hubs : INDIA_HUBS)
  .slice()
  .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const activeCount = displayHubs.filter(h => h.active !== false).length;

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><Spinner size={32} color="#10b981" /></div>;

  const modeBtn = (mode, label) => (
    <button onClick={() => setManagerForm(p => ({ ...p, mode }))} style={{ flex: 1, padding: '8px', border: `2px solid ${managerForm.mode === mode ? '#10b981' : '#d1fae5'}`, borderRadius: 8, background: managerForm.mode === mode ? '#ecfdf5' : '#fff', color: managerForm.mode === mode ? '#065f46' : '#4b7063', fontWeight: managerForm.mode === mode ? 700 : 400, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
      {label}
    </button>
  );

  return (
    <div>
      <SectionHeader title="Hub Network" subtitle={`${displayHubs.length} hubs — ${activeCount} active`}
       action={
  <div style={{ display:'flex', gap:8 }}>
    <Button variant="primary" onClick={() => setShowMap(true)}>
      Hub network
    </Button>
    <Button variant="primary" onClick={() => { setWizardStep(STEPS.HUB); setWizardAlert(null); }}>
      + Add Hub
    </Button>
  </div>
} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[{ label: 'Total Hubs', value: displayHubs.length, color: '#10b981' }, { label: 'Active', value: activeCount, color: '#059669' }, { label: 'Inactive', value: displayHubs.length - activeCount, color: '#ef4444' }, { label: 'Managed', value: displayHubs.filter(h => getManager(h.id)).length, color: '#0d9488' }].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 11, padding: '14px 18px', borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-1px' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#4b7063', marginTop: 3, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="All Hubs" subtitle="Manage managers and hub status" />
        <Table columns={[
          { label: 'Hub',     render: h => <div style={{ fontWeight: 700, color: '#0f2b22' }}>{h.name || `Hub ${h.id}`}</div> },
          { label: 'City',    render: h => <span style={{ fontSize: 13 }}>{h.city}</span> },
          { label: 'Manager', render: h => { const m = getManager(h.id); return m ? <div><div style={{ fontSize: 13, fontWeight: 700, color: '#0f2b22' }}>{m.name}</div><div style={{ fontSize: 11, color: '#4b7063' }}>{m.email}</div></div> : <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠ No manager</span>; }},
          { label: 'Status',  render: h => <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: h.active !== false ? '#ecfdf5' : '#f8fafc', color: h.active !== false ? '#065f46' : '#4b7063', border: `1px solid ${h.active !== false ? '#a7f3d0' : '#e2e8f0'}` }}>{h.active !== false ? '● Active' : '○ Inactive'}</span> },
          { label: 'Actions', render: h => <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="primary" size="xs" onClick={() => openEdit(h)}>👤 {getManager(h.id) ? 'Manage' : 'Assign'}</Button>
            <Button variant={h.active !== false ? 'danger' : 'success'} size="xs" onClick={() => toggleHub(h)}>{h.active !== false ? 'Deactivate' : 'Activate'}</Button>
          </div>},
        ]} rows={displayHubs} />
      </Card>

      {/* Wizard Step 1 */}
      <Modal open={wizardStep === STEPS.HUB} onClose={closeWizard} title="Step 1 of 2 — Create Hub" width={460}
        footer={<><Button variant="ghost" onClick={closeWizard}>Cancel</Button><Button variant="primary" onClick={handleCreateHub} disabled={saving}>{saving ? 'Creating...' : 'Create Hub →'}</Button></>}>
        {wizardAlert && <div style={{ marginBottom: 14 }}><Alert message={wizardAlert.msg} type={wizardAlert.type} /></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Hub Name *" value={hubForm.name||''} onChange={hf('name')} placeholder="Mumbai Central Hub" />
          <Input label="City *" value={hubForm.city||''} onChange={hf('city')} placeholder="Mumbai" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Latitude" value={hubForm.lat||''} onChange={hf('lat')} type="number" placeholder="19.0760" />
            <Input label="Longitude" value={hubForm.lng||''} onChange={hf('lng')} type="number" placeholder="72.8777" />
          </div>
          <div style={{ padding: '9px 12px', background: '#ecfdf5', borderRadius: 7, border: '1px solid #a7f3d0', fontSize: 12, color: '#065f46' }}>💡 Coordinates used for route mapping. Can be updated later.</div>
        </div>
      </Modal>

      {/* Wizard Step 2 */}
      <Modal open={wizardStep === STEPS.MANAGER} onClose={closeWizard} title="Step 2 of 2 — Assign Manager" width={500}
        footer={<><Button variant="ghost" onClick={() => setWizardStep(STEPS.DONE)}>Skip for now</Button><Button variant="primary" onClick={handleAssignManager} disabled={saving}>{saving ? 'Saving...' : '✓ Assign Manager'}</Button></>}>
        {wizardAlert && <div style={{ marginBottom: 14 }}><Alert message={wizardAlert.msg} type={wizardAlert.type} /></div>}
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#065f46' }}>🏭 Assigning manager for: <strong>{newHubName}</strong></div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {modeBtn('new', '+ Create New User')}
          {unassigned.length > 0 && modeBtn('existing', `Assign Existing (${unassigned.length})`)}
        </div>
        {managerForm.mode === 'new' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Name *" value={managerForm.name||''} onChange={mf('name')} placeholder="Amit Singh" />
            <Input label="Email *" value={managerForm.email||''} onChange={mf('email')} type="email" />
            <Input label="Password *" value={managerForm.password||''} onChange={mf('password')} type="password" />
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e4035', marginBottom: 6 }}>Select Existing Manager *</label>
            <select value={managerForm.existingUserId||''} onChange={e => setManagerForm(p => ({ ...p, existingUserId: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1fae5', borderRadius: 8, fontSize: 13, color: '#065f46', background: '#f0fdf9', outline: 'none', fontFamily: 'inherit' }}>
              <option value="">— Select a user —</option>
              {unassigned.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
        )}
      </Modal>

      {/* Done */}
      <Modal open={wizardStep === STEPS.DONE} onClose={closeWizard} title="Hub Created!" width={400}
        footer={<Button variant="primary" onClick={closeWizard}>Done</Button>}>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#065f46' }}>{newHubName} is live!</div>
          <div style={{ fontSize: 13, color: '#4b7063', marginTop: 8 }}>Hub is active in the network. Add staff from Hub Details.</div>
        </div>
      </Modal>

      {/* Edit Manager */}
      {/* <Modal open={!!editManagerHub} onClose={() => setEditManagerHub(null)} title={`Manager — ${editManagerHub?.name}`} width={460}
        footer={<><Button variant="ghost" onClick={() => setEditManagerHub(null)}>Cancel</Button>{editManagerForm.mode === 'update' && <Button variant="danger" onClick={handleDeleteManager}>Remove</Button>}<Button variant="primary" onClick={handleUpdateManager} disabled={saving}>{saving ? 'Saving...' : '✓ Save'}</Button></>}>
        {editAlert && <div style={{ marginBottom: 14 }}><Alert message={editAlert.msg} type={editAlert.type} /></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Manager Name *" value={editManagerForm.name||''} onChange={ef('name')} />
          <Input label="Manager Email *" value={editManagerForm.email||''} onChange={ef('email')} />
          <Input label="Password" value={editManagerForm.password||''} onChange={ef('password')} type="password" placeholder="Leave blank to keep current" />
        </div>
      </Modal> */}

     {/* Edit Manager */}
<Modal
  open={!!editManagerHub}
  onClose={() => setEditManagerHub(null)}
  title={`Manager — ${editManagerHub?.name}`}
  width={460}
  footer={
    <>
      <Button variant="ghost" onClick={() => setEditManagerHub(null)}>
        Cancel
      </Button>

      {editManagerForm.mode === "update" && (
        <Button variant="danger" onClick={handleDeleteManager}>
          Deassign
        </Button>
      )}

      <Button variant="primary" onClick={handleUpdateManager} disabled={saving}>
        {saving ? "Saving..." : "✓ Save"}
      </Button>
    </>
  }
>
  {editAlert && (
    <div style={{ marginBottom: 14 }}>
      <Alert message={editAlert.msg} type={editAlert.type} />
    </div>
  )}

  {/* UPDATE MODE → Show existing manager */}
  {editManagerForm.mode === "update" ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input
        label="Manager Name"
        value={editManagerForm.name || ""}
        onChange={ef("name")}
      />

      <Input
        label="Manager Email"
        value={editManagerForm.email || ""}
        onChange={ef("email")}
      />

      <Input
        label="Password"
        value={editManagerForm.password || ""}
        onChange={ef("password")}
        type="password"
        placeholder="Leave blank to keep current"
      />
    </div>
  ) : (
    <>
      {/* ASSIGN MODE → Show Create/Existing options */}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() =>
            setEditManagerForm(p => ({ ...p, mode: "new" }))
          }
          style={{
            flex: 1,
            padding: "8px",
            border: `2px solid ${
              editManagerForm.mode === "new" ? "#10b981" : "#d1fae5"
            }`,
            borderRadius: 8,
            background: editManagerForm.mode === "new" ? "#ecfdf5" : "#fff",
            cursor: "pointer"
          }}
        >
          + Create New
        </button>

        {unassigned.length > 0 && (
          <button
            onClick={() =>
              setEditManagerForm(p => ({ ...p, mode: "existing" }))
            }
            style={{
              flex: 1,
              padding: "8px",
              border: `2px solid ${
                editManagerForm.mode === "existing"
                  ? "#10b981"
                  : "#d1fae5"
              }`,
              borderRadius: 8,
              background:
                editManagerForm.mode === "existing"
                  ? "#ecfdf5"
                  : "#fff",
              cursor: "pointer"
            }}
          >
            Assign Existing ({unassigned.length})
          </button>
        )}
      </div>

      {/* CREATE NEW MANAGER */}
      {editManagerForm.mode === "new" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            label="Manager Name *"
            value={editManagerForm.name || ""}
            onChange={ef("name")}
          />

          <Input
            label="Manager Email *"
            value={editManagerForm.email || ""}
            onChange={ef("email")}
          />

          <Input
            label="Password *"
            value={editManagerForm.password || ""}
            onChange={ef("password")}
            type="password"
          />
        </div>
      ) : (
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 6
            }}
          >
            Select Existing Manager *
          </label>

          <select
            value={editManagerForm.existingUserId || ""}
            onChange={e =>
              setEditManagerForm(p => ({
                ...p,
                existingUserId: e.target.value
              }))
            }
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1px solid #d1fae5",
              borderRadius: 8
            }}
          >
            <option value="">— Select a user —</option>

            {unassigned.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  )}
</Modal>
      <HubNetworkMap
  open={showMap}
  onClose={() => setShowMap(false)}
  hubs={displayHubs}
  getManager={getManager}
/>
    </div>

    
  );
}
