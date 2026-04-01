import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SectionHeader, StatCard, Card, CardHeader,
  TrackingBadge, StatusBadge, Button, Modal, Input, Alert, Spinner
} from '../../ui';
import { deliveryAPI, shipmentAPI, userAPI } from '../../../services/api';
import ReportDelayInline from '../staff/ReportDelayInline';

export default function HubDashboard({ user, onViewShipment }) {
  const navigate = useNavigate();
  const [tasks,      setTasks]      = useState([]);
  const [staff,      setStaff]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error,      setError]      = useState(null);
  const [otpModal,   setOtpModal]   = useState(null);
  const [otp,        setOtp]        = useState('');
  const [otpAlert,   setOtpAlert]   = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [delayOpenId,setDelayOpenId]= useState(null);
  const [failModal,  setFailModal]  = useState(null);
  const [failReason, setFailReason] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, staffR] = await Promise.allSettled([
        deliveryAPI.getMyTasks(),
        userAPI.getStaffByHub(user.hubId),
      ]);
      if (tr.status    === 'fulfilled') setTasks(tr.value.data?.data    || tr.value.data    || []);
      if (staffR.status === 'fulfilled') setStaff(staffR.value.data?.data || staffR.value.data || []);
    } catch {}
    setLoading(false);
  }, [user.hubId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showSuccess = msg => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500); };

  const quickStep = async (task, status, failureReason = null) => {
    setUpdating(task.id);
    try {
      await deliveryAPI.updateHubStep({
        shipmentId: task.shipmentId || task.id,
        stepOrder:  task.stepOrder,
        status,
        failureReason,
      });
      showSuccess(`Shipment ${task.shipmentTrackingId} → ${status.replace(/_/g, ' ')}`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed.');
      setTimeout(() => setError(null), 4000);
    }
    setUpdating(null);
  };

  const submitOtp = async () => {
    if (otp.length !== 6) { setOtpAlert('OTP must be 6 digits.'); return; }
    setOtpLoading(true); setOtpAlert(null);
    try {
      await deliveryAPI.confirmOtp(otpModal.shipmentTrackingId, otp);
      setOtpModal(null);
      showSuccess('Delivery confirmed! Shipment marked as DELIVERED.');
      await loadAll();
    } catch (err) { setOtpAlert(err?.response?.data?.message || 'Invalid OTP.'); }
    setOtpLoading(false);
  };

  const submitFail = async () => {
    if (!failReason.trim()) return;
    await quickStep(failModal.task, failModal.status, failReason);
    setFailModal(null);
  };

  // Derive last-step flag same way as StaffTasks
  const maxStepByShipment = tasks.reduce((acc, t) => {
    if (acc[t.shipmentId] === undefined || t.stepOrder > acc[t.shipmentId])
      acc[t.shipmentId] = t.stepOrder;
    return acc;
  }, {});
  const taggedTasks = tasks.map(t => ({
    ...t,
    isDestinationHub: t.totalSteps != null
      ? t.stepOrder === t.totalSteps - 1
      : t.stepOrder === maxStepByShipment[t.shipmentId],
  }));

  const pendingCount  = taggedTasks.filter(t => ['PENDING','ARRIVED'].includes(t.status) && t.unlocked).length;
  const activeCount   = taggedTasks.filter(t => !['DISPATCHED','DELIVERED','FAILED'].includes(t.status)).length;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <Spinner size={36} color="var(--em-500)" />
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-muted)' }}>Loading hub data...</div>
    </div>
  );

  return (
    <div>
      {/* ── HUB BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46, #047857, #059669)',
        borderRadius: 'var(--radius-lg)', padding: '20px 26px', marginBottom: 22,
        display: 'flex', alignItems: 'center', gap: 16, color: '#fff',
        boxShadow: '0 4px 24px rgba(6,95,70,.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -20, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -50, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        <div style={{ fontSize: 38, flexShrink: 0 }}>🏭</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.3px' }}>{user.hubName}</div>
          <div style={{ fontSize: 12, opacity: .75, marginTop: 3 }}>
            Hub Manager · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Button size="sm" onClick={loadAll}
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
            ↺ Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/reschedule-mgr')}
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
            📅 Reschedule
          </Button>
          <Button size="sm" onClick={() => navigate('/hub-staff')}
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
            👥 Staff
          </Button>
        </div>
      </div>

      {successMsg && <div style={{ marginBottom: 14 }}><Alert message={successMsg} type="success" /></div>}
      {error      && <div style={{ marginBottom: 14 }}><Alert message={error}      type="danger"  /></div>}

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard icon="📋" label="Awaiting Action"  value={pendingCount}        color="var(--em-500)" onClick={() => navigate('/staff-tasks')} />
        <StatCard icon="🚚" label="Active Tasks"     value={activeCount}          color="var(--teal-500)" />
        <StatCard icon="👥" label="Staff Members"    value={staff.length}         color="#059669" onClick={() => navigate('/hub-staff')} />
      </div>

      {/* ── TASKS ── */}
      <div style={{
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--em-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          background: 'linear-gradient(135deg, rgba(16,185,129,.06) 0%, rgba(20,184,166,.04) 100%)',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>Hub Tasks</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
              {taggedTasks.length} total · {pendingCount} need action
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/staff-tasks')}>
            View Full Task List →
          </Button>
        </div>

        {/* Task list */}
        <div style={{ padding: '12px 14px', maxHeight: 560, overflowY: 'auto' }}>
          {taggedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>All clear!</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>No active tasks at your hub right now.</div>
            </div>
          ) : (
            taggedTasks.map(t => (
              <HubTaskCard
                key={t.id}
                task={t}
                updating={updating}
                delayOpen={delayOpenId === t.id}
                onQuickStep={quickStep}
                onOtpOpen={task => { setOtp(''); setOtpAlert(null); setOtpModal(task); }}
                onOtpRedirect={task => navigate('/otp', { state: { trackingId: task.shipmentTrackingId } })}
                onDelayOpen={() => setDelayOpenId(t.id)}
                onDelayClose={() => setDelayOpenId(null)}
                onDelaySuccess={() => { setDelayOpenId(null); loadAll(); }}
                onFailOpen={task => { setFailReason(''); setFailModal({ task, status: 'DELIVERY_ATTEMPTED', label: '⚠ Delivery Failed' }); }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── FAILURE REASON MODAL ── */}
      <Modal open={!!failModal} onClose={() => setFailModal(null)}
        title={failModal?.label || 'Update Step'} width={440}
        footer={<>
          <Button variant="ghost" onClick={() => setFailModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={submitFail} disabled={!failReason.trim() || !!updating}>Confirm</Button>
        </>}>
        <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e', marginBottom: 14 }}>
          ⚠ This will be recorded in the shipment timeline.
        </div>
        <Input label="Reason *" value={failReason}
          onChange={e => setFailReason(e.target.value)}
          placeholder="e.g. Customer not home, address unclear..." />
      </Modal>

      {/* ── OTP MODAL ── */}
      <Modal open={!!otpModal} onClose={() => setOtpModal(null)}
        title="Confirm Delivery — Enter OTP" width={440}
        footer={<>
          <Button variant="ghost" onClick={async () => {
            try { await deliveryAPI.resendOtp(otpModal?.shipmentTrackingId); setOtpAlert('New OTP sent to customer.'); }
            catch { setOtpAlert('Failed to resend.'); }
          }}>↺ Resend OTP</Button>
          <Button variant="primary" onClick={submitOtp} disabled={otpLoading}>
            {otpLoading ? 'Verifying...' : '✅ Confirm Delivery'}
          </Button>
        </>}>
        {otpAlert && <div style={{ marginBottom: 12 }}><Alert message={otpAlert} type={otpAlert.includes('sent') ? 'info' : 'danger'} /></div>}
        {otpModal && (
          <div style={{ marginBottom: 12 }}>
            <TrackingBadge id={otpModal.shipmentTrackingId} />
          </div>
        )}
        <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5 }}>
          Ask the customer for the 6-digit OTP sent to their registered contact.
        </div>
        <input value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6} placeholder="• • • • • •"
          style={{
            width: '100%', padding: '14px',
            border: '2px solid var(--em-100)', borderRadius: 10,
            fontSize: 30, letterSpacing: 16, textAlign: 'center',
            fontFamily: 'inherit', color: 'var(--em-800)',
            outline: 'none', fontWeight: 900, boxSizing: 'border-box',
            transition: 'border-color .15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--em-400)'}
          onBlur={e  => e.target.style.borderColor = 'var(--em-100)'} />
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-muted)', textAlign: 'center' }}>
          ✓ Valid for 15 minutes · Max 3 attempts before lockout
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════
   HUB TASK CARD
══════════════════════════════════════════ */
function HubTaskCard({ task, updating, delayOpen, onQuickStep, onOtpOpen, onOtpRedirect, onDelayOpen, onDelayClose, onDelaySuccess, onFailOpen }) {
  const isActionable    = task.unlocked;
  const isArrivedFinal  = task.status === 'ARRIVED' && task.isDestinationHub;
  const isUpdating      = updating === task.id;

  const borderColor = !isActionable
    ? 'var(--em-200)'
    : isArrivedFinal
      ? '#f59e0b'
      : task.status === 'ARRIVED'
        ? 'var(--em-500)'
        : 'var(--em-300)';

  return (
    <div style={{
      background: isArrivedFinal ? '#fffdf5' : '#f8fffe',
      border: '1px solid var(--em-100)',
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      marginBottom: 10,
      opacity: !isActionable ? .65 : 1,
      transition: 'all .15s',
    }}>
      {/* Top row: tracking + step + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <TrackingBadge id={task.shipmentTrackingId} />
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--color-muted)',
              background: 'var(--em-50)', border: '1px solid var(--em-100)',
              borderRadius: 99, padding: '2px 8px',
            }}>
              Step {task.stepOrder + 1}{task.totalSteps ? ` of ${task.totalSteps}` : ''}
            </span>
            {task.isDestinationHub && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: '#eff6ff', color: '#1e40af',
                border: '1px solid #bfdbfe', borderRadius: 99, padding: '2px 8px',
              }}>
                🏁 Final Hub
              </span>
            )}
          </div>

          {/* Hub name + next hub */}
          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>🏭 {task.hubName}</span>
            {task.nextHubName && !task.isDestinationHub && (
              <>
                <span style={{ color: 'var(--em-300)' }}>→</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: 'var(--em-50)', border: '1px solid var(--em-200)',
                  color: 'var(--em-700)', borderRadius: 6, padding: '2px 8px',
                }}>
                  🏭 {task.nextHubName}{task.nextHubCity ? `, ${task.nextHubCity}` : ''}
                </span>
              </>
            )}
          </div>

          {/* Out for delivery info at final hub */}
          {isArrivedFinal && isActionable && (
            <div style={{
              marginTop: 8, padding: '8px 12px',
              background: '#fffbeb', border: '1px solid #fcd34d',
              borderRadius: 8, fontSize: 12, color: '#92400e',
            }}>
              <span style={{ fontWeight: 700 }}>📦 Out for Delivery</span>
              <span style={{ opacity: .85 }}> — OTP sent to customer. Proceed to verify.</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Action buttons */}
      {isActionable && !isUpdating && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* PENDING → Mark Arrived */}
          {task.status === 'PENDING' && (
            <Button variant="primary" size="xs" onClick={() => onQuickStep(task, 'ARRIVED')}>
              📍 Mark Arrived
            </Button>
          )}

          {/* ARRIVED at final hub → Verify OTP redirect + Could Not Deliver */}
          {isArrivedFinal && (
            <>
              <Button variant="primary" size="xs"
                style={{ background: '#f59e0b', borderColor: '#d97706', color: '#fff' }}
                onClick={() => onOtpRedirect(task)}>
                🛵 Proceed &amp; Verify OTP
              </Button>
              <Button variant="warning" size="xs"
                onClick={() => onFailOpen(task)}>
                ⚠ Could Not Deliver
              </Button>
            </>
          )}

          {/* ARRIVED at non-final hub → Dispatch */}
          {task.status === 'ARRIVED' && !task.isDestinationHub && (
            <Button variant="primary" size="xs" onClick={() => onQuickStep(task, 'DISPATCHED')}>
              🚚 Dispatch to Next Hub
            </Button>
          )}

          {/* DELIVERY_ATTEMPTED → Retry or Fail */}
          {task.status === 'DELIVERY_ATTEMPTED' && (
            <>
              <Button variant="warning" size="xs"
                onClick={() => onFailOpen(task)}>
                🔄 Retry Delivery
              </Button>
              <Button variant="danger" size="xs"
                onClick={() => onQuickStep(task, 'FAILED', 'Max attempts reached.')}>
                ✕ Mark Failed
              </Button>
            </>
          )}

          {/* Report Delay — available on all non-final-arrived actionable tasks */}
          {!isArrivedFinal && (
            <button onClick={delayOpen ? onDelayClose : onDelayOpen} style={{
              marginLeft: 'auto',
              padding: '4px 10px', borderRadius: 99,
              border: `1px solid ${delayOpen ? '#fcd34d' : 'var(--em-200)'}`,
              background: delayOpen ? '#fffbeb' : 'transparent',
              color: delayOpen ? '#a16207' : 'var(--color-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all .12s', fontFamily: 'var(--font-sans)',
            }}>
              ⏳ {delayOpen ? 'Cancel' : 'Report Delay'}
            </button>
          )}
        </div>
      )}

      {isUpdating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--em-600)' }}>
          <Spinner size={12} color="var(--em-500)" /> Updating...
        </div>
      )}

      {!isActionable && (
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
          🔒 Waiting for previous hub to dispatch
        </div>
      )}

      {/* Inline delay panel */}
      {delayOpen && (
        <ReportDelayInline
          trackingId={task.shipmentTrackingId}
          onSuccess={onDelaySuccess}
          onCancel={onDelayClose}
        />
      )}
    </div>
  );
}