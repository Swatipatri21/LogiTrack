import React, { useState } from 'react';
import { SectionHeader, Card, CardHeader, Button, Input, Textarea, Alert } from '../../ui';

export default function NotificationCenter() {
  const [emailForm, setEmailForm] = useState({ subject:'', message:'', type:'DELAY' });
  const [smsForm, setSmsForm] = useState({ message:'', type:'DELAY' });
  const [emailAlert, setEmailAlert] = useState(null);
  const [smsAlert, setSmsAlert] = useState(null);
  const [sending, setSending] = useState(false);

  const notifTypes = [{ value:'DELAY',label:'Delay Notification' },{ value:'FAILURE',label:'Delivery Failure' },{ value:'SUCCESS',label:'Delivery Confirmation' },{ value:'OTP',label:'OTP Alert' }];

  const sendEmail = async () => {
    setSending(true);
    setTimeout(()=>{ setEmailAlert({ msg:'Email notification queued for delivery.', type:'success' }); setSending(false); }, 800);
  };
  const sendSMS = async () => {
    setSending(true);
    setTimeout(()=>{ setSmsAlert({ msg:'SMS notification queued for delivery.', type:'success' }); setSending(false); }, 600);
  };

  const recent = [
    { id:1, type:'DELAY', channel:'Email+SMS', recipient:'priya@example.com', msg:'Your shipment TRK-001 has been delayed by 24 hours due to weather conditions.', time:'2 hours ago', status:'Sent' },
    { id:2, type:'SUCCESS', channel:'Email', recipient:'rahul.k@example.com', msg:'Your package TRK-002 has been delivered successfully.', time:'4 hours ago', status:'Sent' },
    { id:3, type:'FAILURE', channel:'SMS', recipient:'+91 9876543210', msg:'Delivery attempt failed for TRK-003. Driver will retry tomorrow.', time:'6 hours ago', status:'Sent' },
    { id:4, type:'OTP', channel:'SMS', recipient:'+91 8765432109', msg:'Your OTP for delivery confirmation is 847291.', time:'8 hours ago', status:'Sent' },
  ];

  const typeColor = { DELAY:'#f59e0b', SUCCESS:'#10b981', FAILURE:'#ef4444', OTP:'#06b6d4' };

  return (
    <div>
      <SectionHeader title="Notification Center" subtitle="Send email and SMS alerts for delays, failures, and confirmations" />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {/* Email */}
        <Card>
          <CardHeader title="📧 Email Alerts" subtitle="Send email notifications to customers" />
          <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
            {emailAlert && <Alert message={emailAlert.msg} type={emailAlert.type} />}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1e4035', marginBottom:5 }}>Notification Type</label>
              <select value={emailForm.type} onChange={e=>setEmailForm(p=>({...p,type:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1fae5', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#f0fdf9', color:'#065f46', outline:'none' }}>
                {notifTypes.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Input label="Subject" value={emailForm.subject} onChange={e=>setEmailForm(p=>({...p,subject:e.target.value}))} placeholder="Your shipment has been delayed..." />
            <Textarea label="Message" value={emailForm.message} onChange={e=>setEmailForm(p=>({...p,message:e.target.value}))} placeholder="Write the email content here..." rows={4} />
            <Button variant="primary" onClick={sendEmail} disabled={sending}>
              {sending ? 'Sending...' : '📧 Send Email Notifications'}
            </Button>
          </div>
        </Card>

        {/* SMS */}
        <Card>
          <CardHeader title="📱 SMS Alerts" subtitle="Send SMS notifications to customer phones" />
          <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
            {smsAlert && <Alert message={smsAlert.msg} type={smsAlert.type} />}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1e4035', marginBottom:5 }}>Notification Type</label>
              <select value={smsForm.type} onChange={e=>setSmsForm(p=>({...p,type:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1fae5', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#f0fdf9', color:'#065f46', outline:'none' }}>
                {notifTypes.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Textarea label="SMS Message (max 160 chars)" value={smsForm.message} onChange={e=>setSmsForm(p=>({...p,message:e.target.value.slice(0,160)}))} placeholder="SMS message content..." rows={4} />
            <div style={{ fontSize:11, color:'#4b7063', textAlign:'right' }}>{smsForm.message.length}/160 characters</div>
            <Button variant="success" onClick={sendSMS} disabled={sending}>
              {sending ? 'Sending...' : '📱 Send SMS Notifications'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent */}
      <Card>
        <CardHeader title="Recent Notifications" subtitle="Last sent alerts" />
        <div style={{ padding:'0 4px' }}>
          {recent.map(n => (
            <div key={n.id} style={{ padding:'14px 20px', borderBottom:'1px solid #ecfdf5', display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:typeColor[n.type]||'#94a3b8', marginTop:5, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11.5, fontWeight:700, padding:'2px 9px', borderRadius:20, background:`${typeColor[n.type]||'#94a3b8'}15`, color:typeColor[n.type]||'#94a3b8' }}>{n.type}</span>
                    <span style={{ fontSize:11.5, color:'#4b7063', fontWeight:600 }}>{n.channel}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'#4b7063' }}>{n.time}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'#059669', background:'#ecfdf5', padding:'2px 8px', borderRadius:20 }}>{n.status}</span>
                  </div>
                </div>
                <div style={{ fontSize:12, color:'#4b7063' }}><strong>To:</strong> {n.recipient}</div>
                <div style={{ fontSize:12.5, color:'#0f2b22', marginTop:3 }}>{n.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
