import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, Table, RoleBadge, Button, Modal, Input, Select, Alert, Spinner } from '../../ui';
import { userAPI, hubAPI, authAPI } from '../../../services/api';
import { fmtDate } from '../../../utils/helpers';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'',email:'',password:'',role:'STAFF',hubId:'' });
  const [formAlert, setFormAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([userAPI.getAll(), hubAPI.getAll()])
      .then(([uRes, hRes]) => {
        setUsers(uRes.data?.data || uRes.data || []);
        setHubs(hRes.data?.data || hRes.data || []);
      }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q);
    return matchQ && (!roleFilter || u.role === roleFilter);
  });

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const addUser = async () => {
    if (!form.name||!form.email||!form.password) { setFormAlert('All fields required.'); return; }
    setSaving(true); setFormAlert(null);
    try {
      const res = await authAPI.register({ name:form.name, email:form.email, password:form.password, role:form.role, hubId:form.hubId||undefined });
      const newUser = res.data?.data || res.data;
      setUsers(prev => [newUser, ...prev]);
      setShowAdd(false); setForm({ name:'',email:'',password:'',role:'STAFF',hubId:'' });
    } catch(err) { setFormAlert(err?.response?.data?.message||'Registration failed.'); }
    setSaving(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await userAPI.deleteUser(id); } catch {}
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateRole = async (id, role) => {
    try { await userAPI.updateRole(id, role); setUsers(prev => prev.map(u => u.id===id?{...u,role}:u)); } catch {}
  };

  const hubMap = Object.fromEntries(hubs.map(h=>[h.id, h.name||`Hub ${h.id}`]));
  const hubOptions = [{ value:'',label:'— No Hub —' }, ...hubs.map(h=>({ value:h.id, label:h.name||`Hub ${h.id}` }))];
  const roleOptions = [{ value:'',label:'All Roles' },{ value:'ADMIN',label:'Admin' },{ value:'HUB_MANAGER',label:'Hub Manager' },{ value:'STAFF',label:'Staff' }];

  if (loading) return <div style={{ textAlign:'center', padding:'80px 20px' }}><Spinner size={32} color="#10b981" /></div>;

  return (
    <div>
      <SectionHeader title="User Management" subtitle="Assign roles, hubs and manage all platform users"
        action={<Button variant="primary" onClick={()=>{ setShowAdd(true); setForm({ name:'',email:'',password:'',role:'STAFF',hubId:'' }); setFormAlert(null); }}>+ Add User</Button>} />

      <Card>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #ecfdf5', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email..."
            style={{ flex:1, minWidth:200, padding:'7px 12px', border:'1px solid #d1fae5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit', background:'#f0fdf9' }} />
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}
            style={{ padding:'7px 12px', border:'1px solid #d1fae5', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#f0fdf9', color:'#065f46' }}>
            {roleOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span style={{ fontSize:12, color:'#4b7063' }}>{filtered.length} users</span>
        </div>
        <Table columns={[
          { label:'User', render:u=>(
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff' }}>{u.name?.[0]?.toUpperCase()}</div>
              <div><div style={{ fontWeight:700, color:'#0f2b22' }}>{u.name}</div><div style={{ fontSize:11, color:'#4b7063' }}>{u.email}</div></div>
            </div>
          )},
          { label:'Role', render:u=><RoleBadge role={u.role} /> },
          { label:'Hub', render:u=><span style={{ fontSize:12, color:'#4b7063' }}>{u.hubName||hubMap[u.hubId]||'—'}</span> },
          { label:'Joined', render:u=><span style={{ fontSize:11.5, color:'#4b7063' }}>{fmtDate(u.createdAt)}</span> },
          { label:'Actions', render:u=>(
            <div style={{ display:'flex', gap:6 }}>
              <select defaultValue={u.role} onChange={e=>updateRole(u.id, e.target.value)}
                style={{ padding:'4px 8px', border:'1px solid #d1fae5', borderRadius:7, fontSize:12, fontFamily:'inherit', background:'#f0fdf9', color:'#065f46' }}>
                {['ADMIN','HUB_MANAGER','STAFF'].map(r=><option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
              </select>
              <Button variant="danger" size="xs" onClick={()=>deleteUser(u.id)}>Delete</Button>
            </div>
          )},
        ]} rows={filtered} emptyText="No users found" />
      </Card>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New User" width={460}
        footer={<><Button variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Button><Button variant="primary" onClick={addUser} disabled={saving}>{saving?'Adding...':'+ Add User'}</Button></>}>
        {formAlert && <div style={{ marginBottom:12 }}><Alert message={formAlert} type="danger" /></div>}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Input label="Full Name *" value={form.name} onChange={f('name')} placeholder="Arun Sharma" />
          <Input label="Email *" value={form.email} onChange={f('email')} type="email" placeholder="arun@logitrack.com" />
          <Input label="Password *" value={form.password} onChange={f('password')} type="password" />
          <Select label="Role" value={form.role} onChange={f('role')} options={[{ value:'ADMIN',label:'Admin' },{ value:'HUB_MANAGER',label:'Hub Manager' },{ value:'STAFF',label:'Staff' }]} />
          <Select label="Hub Assignment" value={form.hubId} onChange={f('hubId')} options={hubOptions} />
        </div>
      </Modal>
    </div>
  );
}
