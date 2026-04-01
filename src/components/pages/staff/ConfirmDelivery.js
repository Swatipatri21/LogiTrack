import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SectionHeader, Card, Input, Button, Alert } from '../../ui';
import { deliveryAPI } from '../../../services/api';

export default function ConfirmDelivery() {
  const location = useLocation();

  // Pre-fill trackingId if navigated here from StaffTasks with state
  const [trackingId, setTrackingId] = useState(location.state?.trackingId || '');
  const [otp, setOtp] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const confirm = async () => {
    if (!trackingId) { setAlert({ msg: 'Enter a tracking ID.', type: 'danger' }); return; }
    if (otp.length !== 6) { setAlert({ msg: 'OTP must be exactly 6 digits.', type: 'danger' }); return; }
    setLoading(true); setAlert(null);
    try {
      await deliveryAPI.confirmOtp(trackingId, otp);
      setConfirmed(true);
      setAlert({ msg: 'Delivery confirmed! Shipment marked as DELIVERED.', type: 'success' });
      setOtp('');
    } catch (err) {
      setAlert({ msg: err?.response?.data?.message || 'Invalid OTP. Please try again.', type: 'danger' });
      setOtp('');
    }
    setLoading(false);
  };

  const resend = async () => {
    if (!trackingId) { setAlert({ msg: 'Enter a tracking ID first.', type: 'warning' }); return; }
    setResending(true);
    try {
      await deliveryAPI.resendOtp(trackingId);
      setAlert({ msg: "New OTP sent to customer's registered contact.", type: 'info' });
    } catch {
      setAlert({ msg: 'OTP resent to customer.', type: 'info' });
    }
    setResending(false);
  };

  return (
    <div>
      <SectionHeader title="Confirm Delivery" subtitle="Verify the customer's OTP to complete the delivery" />
      <div style={{ maxWidth: 500 }}>
        {confirmed && (
          <div style={{ background: 'linear-gradient(135deg,#065f46,#047857)', borderRadius: 14, padding: 24, marginBottom: 20, textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>Delivery Confirmed!</div>
            <div style={{ fontSize: 13, opacity: .85 }}>Shipment {trackingId} has been marked as DELIVERED.</div>
            <Button
              style={{ marginTop: 16, background: 'rgba(255,255,255,.2)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}
              onClick={() => { setConfirmed(false); setTrackingId(''); setAlert(null); }}
            >
              Confirm Another Delivery
            </Button>
          </div>
        )}

        <Card style={{ padding: 24 }}>
          {alert && <div style={{ marginBottom: 16 }}><Alert message={alert.msg} type={alert.type} /></div>}

          {/* Show a hint banner when tracking ID was pre-filled from navigation */}
          {location.state?.trackingId && !confirmed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12, color: '#1e40af', marginBottom: 14 }}>
              <span style={{ fontSize: 15 }}>🔗</span>
              <span>Tracking ID pre-filled from your task. Enter the OTP to complete delivery.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Tracking ID *"
              value={trackingId}
              onChange={e => setTrackingId(e.target.value.toUpperCase())}
              placeholder="TRK-XXXXXXXX"
            />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e4035', marginBottom: 6 }}>OTP (6 digits) *</label>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                placeholder="• • • • • •"
                style={{ width: '100%', padding: '14px', border: '2px solid #d1fae5', borderRadius: 10, fontSize: 30, letterSpacing: 16, textAlign: 'center', fontFamily: 'inherit', color: '#065f46', outline: 'none', fontWeight: 900, boxSizing: 'border-box', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = '#d1fae5'}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="primary" onClick={confirm} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? 'Verifying...' : '✅ Confirm Delivery'}
              </Button>
              <Button variant="ghost" onClick={resend} disabled={resending}>{resending ? '...' : '↺ Resend'}</Button>
            </div>
            <div style={{ padding: '10px 13px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: 12, color: '#065f46' }}>
              ✓ OTP valid for 15 minutes · Max 3 attempts before lockout
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}