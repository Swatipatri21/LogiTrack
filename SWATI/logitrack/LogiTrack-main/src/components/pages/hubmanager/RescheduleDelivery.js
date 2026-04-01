import React, { useState } from 'react';
import { SectionHeader, Card, Input, Button, Alert } from '../../ui';
import { deliveryAPI } from '../../../services/api';

export default function RescheduleDelivery({ role }) {
  const [trackingId, setTrackingId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

 const submit = async () => {
    if (!trackingId) { setAlert({ msg:'Enter a tracking ID.', type:'danger' }); return; }
    if (!newDate) { setAlert({ msg:'Select a new delivery date.', type:'danger' }); return; }
    
    setLoading(true); 
    setAlert(null);
    
    try {
      // ✅ FIX: Construct the full object to match your Java RescheduleRequest DTO
      const requestData = {
        trackingId: trackingId,
        newDeliveryDate: newDate,
        reason: "CUSTOMER_REQUEST", // Or map this to a dropdown value
        notes: reason,              // Mapping your textarea 'reason' state to 'notes'
        newAddress: ""              // Leave empty unless you add an address field
      };

      // ✅ FIX: Pass the WHOLE object, not just the string
      await deliveryAPI.reschedule(requestData);
      
      setAlert({ 
        msg: `Delivery rescheduled to ${new Date(newDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}. Customer has been notified.`, 
        type: 'success' 
      });
      
      setTrackingId(''); 
      setNewDate(''); 
      setReason('');
    } catch(err) { 
      setAlert({ 
        msg: err?.response?.data?.message || 'Reschedule failed. Ensure shipment is OUT_FOR_DELIVERY.', 
        type: 'danger' 
      }); 
    } 
    setLoading(false);
  };

  return (
    <div>
      <SectionHeader title="Reschedule Delivery" subtitle={`${role==='STAFF'?'Staff':'Hub Manager'} — Reschedule a shipment that is out for delivery`} />
      <div style={{ maxWidth:540 }}>
        <Card style={{ padding:24 }}>
          <div style={{ background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:10, padding:14, marginBottom:20, fontSize:13, color:'#065f46' }}>
            <strong>📋 Note:</strong> Rescheduling is only available for shipments at the <strong>Out for Delivery</strong> stage. The customer will automatically receive a notification.
          </div>
          {alert && <div style={{ marginBottom:16 }}><Alert message={alert.msg} type={alert.type} /></div>}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Input label="Tracking ID *" value={trackingId} onChange={e=>setTrackingId(e.target.value.toUpperCase())} placeholder="TRK-XXXXXXXX" />
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1e4035', marginBottom:5 }}>New Delivery Date *</label>
              <input type="date" value={newDate} min={today} onChange={e=>setNewDate(e.target.value)}
                style={{ width:'100%', padding:'10px 13px', border:'1px solid #d1fae5', borderRadius:8, fontSize:13.5, color:'#065f46', outline:'none', fontFamily:'inherit', background:'#f0fdf9', cursor:'pointer' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1e4035', marginBottom:5 }}>Reason (Optional)</label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3}
                placeholder="Customer requested, address issue, failed attempt..."
                style={{ width:'100%', padding:'10px 13px', border:'1px solid #d1fae5', borderRadius:8, fontSize:13.5, color:'#065f46', outline:'none', fontFamily:'inherit', background:'#f0fdf9', resize:'vertical', boxSizing:'border-box' }} />
            </div>
            <Button variant="primary" onClick={submit} disabled={loading}>
              {loading ? 'Rescheduling...' : '📅 Confirm Reschedule'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
