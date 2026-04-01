import React, { useState } from 'react';
import { SectionHeader, Card, Input, Textarea, Button, Alert } from '../../ui';
import { deliveryAPI } from '../../../services/api';

export default function ReportDelay() {
  const [form, setForm] = useState({ trackingId: '', reason: '', additionalHours: '' });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.trackingId || !form.reason || !form.additionalHours) { setAlert({ msg: 'All fields are required.', type: 'danger' }); return; }
    setLoading(true); setAlert(null);
    try {
      await deliveryAPI.reportDelay({ trackingId: form.trackingId, reason: form.reason, additionalHours: parseInt(form.additionalHours) });
      setAlert({ msg: 'Delay reported successfully. Customer has been notified.', type: 'success' });
      setForm({ trackingId: '', reason: '', additionalHours: '' });
    } catch (err) { setAlert({ msg: err?.response?.data?.message || 'Failed to report delay.', type: 'danger' }); }
    setLoading(false);
  };

  return (
    <div>
      <SectionHeader title="Report Delay" subtitle="Notify customers about shipment delays and update ETA" />
      <div style={{ maxWidth: 520 }}>
        <Card style={{ padding: 24 }}>
          {alert && <div style={{ marginBottom: 16 }}><Alert message={alert.msg} type={alert.type} /></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Tracking ID *" value={form.trackingId} onChange={f('trackingId')} placeholder="TRK-XXXXXXXX" />
            <Textarea label="Delay Reason *" value={form.reason} onChange={f('reason')} placeholder="Weather conditions, vehicle breakdown, address issue..." rows={3} />
            <Input label="Additional Hours *" value={form.additionalHours} onChange={f('additionalHours')} type="number" min="1" max="168" placeholder="e.g. 24 (for 1 day delay)" />
            <div style={{ padding: '10px 13px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 7, fontSize: 12, color: '#92400e' }}>⚠ This will update the customer's expected delivery date and send them a delay notification.</div>
            <Button variant="warning" onClick={submit} disabled={loading} style={{ alignSelf: 'flex-start' }}>{loading ? 'Reporting...' : '⚠ Report Delay'}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
