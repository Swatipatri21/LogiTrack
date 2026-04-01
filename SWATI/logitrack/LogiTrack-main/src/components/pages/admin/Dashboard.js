import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard, Card, CardHeader, SectionHeader, Table, TrackingBadge, StatusBadge, Button, Spinner } from '../../ui';

const EM = ['#10b981','#059669','#34d399','#0d9488','#f59e0b','#ef4444'];

export default function Dashboard({ shipments = [], loading, onViewShipment }) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter(s => s.currentStatus === 'DELIVERED').length;
    const inTransit = shipments.filter(s => ['IN_TRANSIT','OUT_FOR_DELIVERY','DISPATCHED'].includes(s.currentStatus)).length;
    const delayed = shipments.filter(s => s.isDelayed || s.currentStatus === 'DELAYED').length;
    const rate = total ? Math.round((delivered/total)*100) : 0;
    return { total, delivered, inTransit, delayed, rate };
  }, [shipments]);

  const statusData = useMemo(() => {
    const counts = {};
    shipments.forEach(s => { const l = s.currentStatus?.replace(/_/g,' ')||'Unknown'; counts[l]=(counts[l]||0)+1; });
    return Object.entries(counts).map(([name,value])=>({ name, value }));
  }, [shipments]);

const recent = shipments
  .slice()
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 7);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <Spinner size={40} color="#10b981" />
      <p style={{ marginTop:16, color:'#4b7063', fontWeight:600 }}>Syncing logistics data...</p>
    </div>
  );

  return (
    <div style={{ paddingBottom:40 }}>
      {/* Welcome banner */}
      <div style={{ background:'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)', borderRadius:16, padding:'22px 28px', marginBottom:24, display:'flex', alignItems:'center', gap:20, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-20, top:-30, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.06)' }} />
        <div style={{ position:'absolute', right:80, bottom:-40, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />
        <div style={{ fontSize:42 }}>🚚</div>
        <div style={{ flex:1, position:'relative' }}>
          <div style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-.3px' }}>Operations Overview</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginTop:4 }}>Real-time tracking for {stats.total} shipments · {stats.rate}% delivery success rate</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {/* <Button onClick={()=>navigate('/analytics')} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.25)', fontSize:12 }} size="sm">📊 Analytics</Button> */}
          {/* <Button onClick={()=>navigate('/sla-reports')} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.25)', fontSize:12 }} size="sm">📈 SLA Reports</Button> */}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard icon="📦" label="Total Volume"    value={stats.total}     color="#10b981" trend={`${stats.rate}% success rate`} onClick={()=>navigate('/shipments')} />
        <StatCard icon="✅" label="Delivered"        value={stats.delivered} color="#059669" trend="Completed deliveries" />
        <StatCard icon="🚚" label="Active Transit"   value={stats.inTransit} color="#0d9488" trend="Currently in motion" />
        <StatCard icon="⚠️" label="Attention Req."  value={stats.delayed}   color="#ef4444" trend="Delayed shipments" onClick={()=>navigate('/sla-reports')} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 0.7fr', gap:20, marginBottom:20 }}>
        {/* Bar Chart */}
        <Card>
          <CardHeader title="Delivery Performance" subtitle="Volume by shipment status" />
          <div style={{ padding:'20px 12px' }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusData} margin={{ top:5, right:10, left:-15, bottom:20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecfdf5" />
                  <XAxis dataKey="name" tick={{ fontSize:10.5, fill:'#4b7063' }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize:10.5, fill:'#4b7063' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius:9, border:'1px solid #d1fae5', fontSize:12, boxShadow:'0 4px 14px rgba(16,185,129,.1)' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[7,7,0,0]} barSize={38} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </div>
        </Card>

        {/* Donut */}
        <Card>
          <CardHeader title="Network Load" subtitle="Status breakdown" />
          <div style={{ padding:'20px 12px', position:'relative' }}>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} innerRadius={60} outerRadius={88} paddingAngle={4} dataKey="value" stroke="none">
                      {statusData.map((_,i)=><Cell key={i} fill={EM[i%EM.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius:8, fontSize:12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:'absolute', top:'55%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                  <div style={{ fontSize:26, fontWeight:900, color:'#065f46' }}>{stats.total}</div>
                  <div style={{ fontSize:10, color:'#4b7063', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px' }}>Total</div>
                </div>
              </>
            ) : <EmptyChart />}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { icon:'📦', label:'Create Shipment', color:'#10b981', path:'/shipments' },
          { icon:'🗺', label:'Manage Hubs', color:'#059669', path:'/hubs' },
          // { icon:'👥', label:'Manage Users', color:'#0d9488', path:'/user-management' },
          // { icon:'🔔', label:'Notifications', color:'#06b6d4', path:'/notifications' },
        ].map(a => (
          <button key={a.label} onClick={()=>navigate(a.path)} style={{ background:'#fff', border:'1px solid #d1fae5', borderRadius:12, padding:'16px 14px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10, transition:'all .15s', textAlign:'left' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#f0fdf9'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(16,185,129,.12)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${a.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{a.icon}</div>
            <span style={{ fontSize:12.5, fontWeight:700, color:'#065f46' }}>{a.label}</span>
          </button>
        ))}
      </div> */}

      {/* Recent Shipments */}
      <Card>
        <CardHeader title="Recent Activity" action={<Button variant="ghost" size="sm" onClick={()=>navigate('/shipments')}>View All →</Button>} />
        <Table
          columns={[
            { label:'Tracking ID', render:s=><TrackingBadge id={s.trackingId} /> },
            { label:'Sender',      render:s=><div style={{ fontWeight:600, color:'#0f2b22', fontSize:13 }}>{s.senderName}</div> },
            { label:'Route',       render:s=><div style={{ fontSize:12, color:'#4b7063' }}><span style={{ fontWeight:600, color:'#1e4035' }}>{s.origin}</span> <span style={{ color:'#a7f3d0' }}>→</span> <span style={{ fontWeight:600, color:'#1e4035' }}>{s.destination}</span></div> },
            { label:'Status',      render:s=><StatusBadge status={s.currentStatus} /> },
            { label:'',            render:s=><Button variant="ghost" size="xs" onClick={()=>onViewShipment(s)}>View</Button> },
          ]}
          rows={recent}
          emptyText="No shipment data available."
        />
      </Card>
    </div>
  );
}

const EmptyChart = () => (
  <div style={{ textAlign:'center', padding:'60px 20px', color:'#4b7063', fontSize:13 }}>
    <div style={{ fontSize:28, marginBottom:8 }}>📊</div>No data yet.
  </div>
);
