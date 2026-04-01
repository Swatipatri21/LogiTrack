import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, TrackingBadge, StatusBadge, Button, Spinner, Modal, Input, Alert } from '../../ui';
import { deliveryAPI, shipmentAPI } from '../../../services/api';
import ReportDelayInline from './ReportDelayInline';

/**
 * ─── COMPLETE DELIVERY FLOW ──────────────────────────────────────────────────
 *
 * NON-FINAL HUB (stepOrder < totalSteps - 1):
 *   PENDING  →  [📍 Mark Arrived]  →  ARRIVED
 *   ARRIVED  →  [🚚 Dispatch to Next Hub]  →  DISPATCHED
 *
 * FINAL HUB (stepOrder === totalSteps - 1):
 *   PENDING  →  [📍 Mark Arrived]  →  ARRIVED
 *     └─ backend automatically:
 *          • sets shipment.currentStatus = OUT_FOR_DELIVERY
 *          • generates OTP and sends it to customer
 *     └─ frontend shows:
 *          • "📦 Out for Delivery" info card (no API call needed)
 *          • [🛵 Proceed to Customer & Verify OTP] → navigates to /confirm-delivery
 *            with trackingId pre-filled
 *
 *   If delivery fails at customer door (from ARRIVED at final hub):
 *   ARRIVED  →  [⚠ Delivery Failed]  →  DELIVERY_ATTEMPTED
 *     └─ backend resets step to ARRIVED for retry
 *     └─ staff can: [🔄 Retry Delivery] or [✕ Mark Failed]
 *
 * HOW FINAL HUB IS DETECTED:
 *   Backend now returns `totalSteps` in ShipmentRouteResponse.
 *   isLastStep = (task.stepOrder === task.totalSteps - 1)
 *   This is reliable regardless of how many tasks the hub staff sees.
 */

const STATUS_FLOW = {
  PENDING: [
    { status: 'ARRIVED', label: '📍 Mark Arrived', variant: 'primary' },
  ],
  // ARRIVED at non-final hub only — final hub ARRIVED is intercepted separately
  ARRIVED: [
    { status: 'DISPATCHED', label: '🚚 Dispatch to Next Hub', variant: 'primary' },
  ],
  // After a failed delivery attempt at final hub
  DELIVERY_ATTEMPTED: [
    { status: 'DELIVERY_ATTEMPTED', label: '🔄 Retry Delivery', variant: 'warning' },
    { status: 'FAILED',             label: '✕ Mark Failed',     variant: 'danger'  },
  ],
};

const ACTIVE_STATUSES = ['PENDING', 'ARRIVED', 'DELIVERY_ATTEMPTED'];

export default function StaffTasks({ user }) {
  const navigate = useNavigate();
  const [tasks,         setTasks]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [updating,      setUpdating]      = useState(null);
  const [error,         setError]         = useState(null);
  const [successMsg,    setSuccessMsg]    = useState(null);
  const [failModal,     setFailModal]     = useState(null);
  const [failReason,    setFailReason]    = useState('');
  const [delayOpenId,   setDelayOpenId]   = useState(null);
  const [receiverModal, setReceiverModal] = useState(null); // { name, phone, address }

  const loadTasks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await deliveryAPI.getMyTasks();
      setTasks(res.data?.data || res.data || []);
    } catch {
      setError('Could not load tasks.');
      setTasks([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const showSuccess = msg => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500); };

  const update = async (task, status, failureReason = null) => {
    setUpdating(task.id);
    try {
      await deliveryAPI.updateHubStep({
        shipmentId: task.shipmentId,
        stepOrder: task.stepOrder,
        status,
        failureReason,
      });
      showSuccess(`Shipment ${task.shipmentTrackingId} marked as ${status.replace(/_/g, ' ')}.`);
      await loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
    setUpdating(null);
  };

  const handleAction = (task, action) => {
    if (['DELIVERY_ATTEMPTED', 'FAILED', 'REJECTED'].includes(action.status)) {
      setFailReason('');
      setFailModal({ task, status: action.status, label: action.label });
    } else {
      update(task, action.status);
    }
  };

  const handleOtpRedirect = (task) => {
    navigate('/otp', { state: { trackingId: task.shipmentTrackingId } });
  };

  const submitFail = async () => {
    if (!failReason.trim()) return;
    await update(failModal.task, failModal.status, failReason);
    setFailModal(null);
  };

  if (loading) return (
    <div>
      <SectionHeader title="My Hub Tasks" subtitle="Shipments awaiting action at your hub" />
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spinner size={32} color="#10b981" />
        <div style={{ marginTop: 12, fontSize: 13, color: '#4b7063' }}>Loading tasks...</div>
      </div>
    </div>
  );

  const active = tasks.filter(t => ACTIVE_STATUSES.includes(t.status) && t.unlocked);
  const others = tasks.filter(t => !(ACTIVE_STATUSES.includes(t.status) && t.unlocked));

  return (
    <div>
      {/* Hub header */}
      <div style={{ background: 'linear-gradient(135deg,#065f46,#047857)', borderRadius: 14, padding: '16px 22px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 14, color: '#fff' }}>
        <div style={{ fontSize: 32 }}>🏭</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{user?.hubName || 'Your Hub'}</div>
          <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>
            {user?.role === 'HUB_MANAGER' ? 'Hub Manager' : 'Staff Member'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ textAlign: 'right', marginRight: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{active.length}</div>
            <div style={{ fontSize: 10, opacity: .7 }}>awaiting action</div>
          </div>
          <Button size="sm" onClick={() => navigate('/reschedule-staff')}
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
            📅 Reschedule
          </Button>
        </div>
      </div>

      <SectionHeader title="My Hub Tasks"
        subtitle={`${tasks.length} total task${tasks.length !== 1 ? 's' : ''}`}
        action={<Button variant="ghost" onClick={loadTasks} size="sm">↺ Refresh</Button>} />

      {successMsg && <div style={{ marginBottom: 16 }}><Alert message={successMsg} type="success" /></div>}
      {error      && <div style={{ marginBottom: 16 }}><Alert message={error}      type="danger"  /></div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {active.map(t => (
          <TaskCard key={t.id} task={t} updating={updating}
            onAction={handleAction} onOtpRedirect={handleOtpRedirect}
            onViewReceiver={setReceiverModal}
            delayOpen={delayOpenId === t.id}
            onDelayOpen={() => setDelayOpenId(t.id)}
            onDelayClose={() => setDelayOpenId(null)}
            onDelaySuccess={() => { setDelayOpenId(null); loadTasks(); }} />
        ))}
        {others.map(t => (
          <TaskCard key={t.id} task={t} updating={updating}
            onAction={handleAction} onOtpRedirect={handleOtpRedirect}
            onViewReceiver={setReceiverModal}
            delayOpen={delayOpenId === t.id}
            onDelayOpen={() => setDelayOpenId(t.id)}
            onDelayClose={() => setDelayOpenId(null)}
            onDelaySuccess={() => { setDelayOpenId(null); loadTasks(); }} />
        ))}
      </div>

      {/* ── Failure reason modal ── */}
      <Modal open={!!failModal} onClose={() => setFailModal(null)}
        title={failModal?.label || 'Update Status'} width={440}
        footer={<>
          <Button variant="ghost" onClick={() => setFailModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={submitFail} disabled={!failReason.trim() || !!updating}>
            Confirm
          </Button>
        </>}>
        <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e', marginBottom: 14 }}>
          ⚠ This will be recorded in the shipment timeline.
        </div>
        <Input label="Reason *" value={failReason}
          onChange={e => setFailReason(e.target.value)}
          placeholder="e.g. Customer not home, address unclear..." />
      </Modal>

      {/* ── Receiver details modal (destination hub staff only) ── */}
      <Modal open={!!receiverModal} onClose={() => setReceiverModal(null)}
        title="📦 Receiver Details" width={400}
        footer={<Button variant="ghost" onClick={() => setReceiverModal(null)}>Close</Button>}>
        {receiverModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: 12, color: '#065f46' }}>
              🏁 This shipment is being delivered at your hub
            </div>
            <div style={{ background: '#f8fffe', border: '1px solid #d1fae5', borderLeft: '3px solid #0ea5e9', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6b7280', marginBottom: 8 }}>🏠 Receiver</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f2b22', marginBottom: 4 }}>{receiverModal.name || '—'}</div>
              <div style={{ fontSize: 12, color: '#4b7063', lineHeight: 1.6 }}>{receiverModal.address || '—'}</div>
              {receiverModal.phone && (
                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: 5 }}>
                  📞 {receiverModal.phone}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── TaskCard ── */
function TaskCard({ task, updating, onAction, onOtpRedirect, onViewReceiver, delayOpen, onDelayOpen, onDelayClose, onDelaySuccess }) {
  const isActionable = task.unlocked;

  // Reliable last-step detection using totalSteps from backend
  const isLastStep = task.totalSteps != null
    ? task.stepOrder === task.totalSteps - 1
    : false;

  // Final hub + package has arrived = OTP was auto-sent by backend, ready for delivery
  const isReadyForDelivery = isLastStep && task.status === 'ARRIVED';

  // What action buttons to show
  const actions = isReadyForDelivery ? [] : (STATUS_FLOW[task.status] || []);

  // Also show failure options at final hub after ARRIVED
  const showFailedAttempt = isLastStep && task.status === 'ARRIVED';

  const borderColor = !isActionable
    ? '#d1fae5'
    : isReadyForDelivery
      ? '#f59e0b'
      : '#10b981';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #d1fae5',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 11,
      padding: '16px 20px',
      opacity: !isActionable ? .6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>

        {/* Left: shipment info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <TrackingBadge id={task.shipmentTrackingId} />
          <span style={{ fontSize: 11, marginLeft: 8, color: '#4b7063' }}>
            Step {task.stepOrder + 1}{task.totalSteps ? ` of ${task.totalSteps}` : ''}
          </span>
          <div style={{ fontSize: 13, marginTop: 5, color: '#1e4035', fontWeight: 600 }}>
            🏭 {task.hubName}{task.hubCity ? `, ${task.hubCity}` : ''}
          </div>

          {/* Next hub indicator */}
          {!isLastStep && task.nextHubName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#6b7280' }}>Dispatches to</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e4035', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 8px' }}>
                🏭 {task.nextHubName}{task.nextHubCity ? `, ${task.nextHubCity}` : ''}
              </span>
            </div>
          )}

          {/* Destination hub: view receiver details button */}
         {isLastStep && isActionable && (
  <button
   onClick={async () => {
  try {
    const res = await shipmentAPI.getById(task.shipmentTrackingId);
    const s = res.data?.data?.shipmentDetails || res.data?.data || res.data;
    onViewReceiver({
      name:    s.receiverName,
      phone:   s.receiverPhone,
      address: s.receiverAddress,
    });
  } catch (err) {
    console.error('API error:', err);
    onViewReceiver({ name: '—', phone: '—', address: 'Could not load details.' });
  }
}}
              style={{
                marginTop: 10,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 13px', borderRadius: 20,
                border: '1px solid #bae6fd',
                background: '#f0f9ff', color: '#0369a1',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              👤 View Receiver Details
            </button>
          )}
        </div>

        {/* Right: status + action buttons */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <StatusBadge status={task.status} />

          {isActionable && updating !== task.id && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10, alignItems: 'flex-end' }}>

              {/* Final hub ARRIVED: OTP redirect */}
              {isReadyForDelivery && (
                <Button
                  variant="primary" size="sm"
                  style={{ background: '#f59e0b', borderColor: '#d97706', color: '#fff' }}
                  onClick={() => onOtpRedirect(task)}
                >
                  🛵 Proceed to Customer &amp; Verify OTP
                </Button>
              )}

              {/* Final hub ARRIVED: mark as failed attempt */}
              {showFailedAttempt && (
                <Button variant="warning" size="sm"
                  onClick={() => onAction(task, { status: 'DELIVERY_ATTEMPTED', label: '⚠ Delivery Failed' })}>
                  ⚠ Could Not Deliver
                </Button>
              )}

              {/* Non-final hub standard actions */}
              {actions.map(a => (
                <Button key={a.status} variant={a.variant} size="sm"
                  onClick={() => onAction(task, a)}>
                  {a.label}
                </Button>
              ))}

              {/* DELIVERY_ATTEMPTED retry/fail */}
              {task.status === 'DELIVERY_ATTEMPTED' && isLastStep && (
                <>
                  <Button variant="warning" size="sm"
                    onClick={() => onAction(task, { status: 'DELIVERY_ATTEMPTED', label: '🔄 Retry Delivery' })}>
                    🔄 Retry Delivery
                  </Button>
                  <Button variant="danger" size="sm"
                    onClick={() => onAction(task, { status: 'FAILED', label: '✕ Mark Failed' })}>
                    ✕ Mark Failed
                  </Button>
                </>
              )}
            </div>
          )}

          {updating === task.id && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#10b981' }}>Updating...</div>
          )}

          {/* Report Delay button */}
          {isActionable && updating !== task.id && !isReadyForDelivery && (
            <button
              onClick={delayOpen ? onDelayClose : onDelayOpen}
              style={{
                marginTop: 10,
                padding: '4px 12px',
                borderRadius: 20,
                border: `1px solid ${delayOpen ? '#fcd34d' : '#e5e7eb'}`,
                background: delayOpen ? '#fffbeb' : 'transparent',
                color: delayOpen ? '#a16207' : '#9ca3af',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              ⏳ {delayOpen ? 'Cancel' : 'Report Delay'}
            </button>
          )}
        </div>
      </div>

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