import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { SectionHeader, Card, CardHeader, StatCard } from '../../ui';

const EM = ['#10b981','#059669','#34d399','#6ee7b7','#0d9488','#14b8a6'];

export default function Analytics({ shipments = [] }) {
  const stats = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter(s => s.currentStatus === 'DELIVERED').length;
    const delayed = shipments.filter(s => s.isDelayed || s.currentStatus === 'DELAYED').length;
    const failed = shipments.filter(s => ['FAILED','RETURNED_TO_SENDER'].includes(s.currentStatus)).length;
    const rate = total ? Math.round((delivered/total)*100) : 0;
    return { total, delivered, delayed, failed, rate };
  }, [shipments]);

  const statusData = useMemo(() => {
    const counts = {};
    shipments.forEach(s => { const l = s.currentStatus?.replace(/_/g,' ')||'Unknown'; counts[l]=(counts[l]||0)+1; });
    return Object.entries(counts).map(([name,value])=>({ name, value }));
  }, [shipments]);

  const weeklyData = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return days.map((day, i) => ({ day, delivered: Math.floor(Math.random()*40+20), delayed: Math.floor(Math.random()*8) }));
  }, []);

  const hubPerf = useMemo(() => {
    const hubs = ['Mumbai','Delhi','Bengaluru','Chennai','Pune','Kolkata'];
    return hubs.map(hub => ({ hub, onTime: Math.floor(Math.random()*30+70), delayed: Math.floor(Math.random()*10) }));
  }, []);

  return (
    <div>
      <SectionHeader title="Analytics Dashboard" subtitle="Delivery performance, delay trends and hub efficiency" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard icon="📦" label="Total Shipments" value={stats.total} color="#10b981" />
        <StatCard icon="✅" label="Delivered" value={stats.delivered} color="#059669" />
        <StatCard icon="⚠️" label="Delayed" value={stats.delayed} color="#f59e0b" />
        <StatCard icon="📈" label="Success Rate" value={`${stats.rate}%`} color="#0d9488" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <CardHeader title="Weekly Delivery Trend" subtitle="Delivered vs Delayed per day" />
          <div style={{ padding:'20px 10px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecfdf5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#4b7063' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#4b7063' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:8, border:'1px solid #d1fae5', fontSize:12 }} />
                <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2.5} dot={{ fill:'#10b981', r:4 }} name="Delivered" />
                <Line type="monotone" dataKey="delayed" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill:'#f59e0b', r:4 }} name="Delayed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Shipment Status Breakdown" subtitle="Current distribution" />
          <div style={{ padding:'20px 10px', position:'relative' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                  {statusData.map((_,i)=><Cell key={i} fill={EM[i%EM.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:8, fontSize:12 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Hub Performance" subtitle="On-time delivery rate per hub" />
        <div style={{ padding:'20px 10px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hubPerf} margin={{ left:-10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecfdf5" vertical={false} />
              <XAxis dataKey="hub" tick={{ fontSize:11, fill:'#4b7063' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#4b7063' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius:8, fontSize:12 }} />
              <Bar dataKey="onTime" fill="#10b981" radius={[6,6,0,0]} barSize={38} name="On-Time %" />
              <Bar dataKey="delayed" fill="#f59e0b" radius={[6,6,0,0]} barSize={38} name="Delayed %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
