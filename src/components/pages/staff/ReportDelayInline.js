/**
 * ReportDelayInline — shared inline delay reporting widget
 *
 * Works for Staff (task cards), Hub Manager (hub shipment list), Admin (search).
 * Just drop inside any card and pass trackingId + callbacks.
 *
 * Props:
 *   trackingId — shipment tracking ID string
 *   onSuccess  — () => void  — called after successful report (refresh parent)
 *   onCancel   — () => void  — called when user dismisses
 */
import React, { useState } from 'react';
import { deliveryAPI } from '../../../services/api';

const REASONS = [
  { value: 'WEATHER',    emoji: '🌧️', label: 'Weather' },
  { value: 'VEHICLE',    emoji: '🚗', label: 'Vehicle breakdown' },
  { value: 'CONGESTION', emoji: '🚦', label: 'Congestion' },
  { value: 'ADDRESS',    emoji: '📍', label: 'Address issue' },
  { value: 'CUSTOMS',    emoji: '🛃', label: 'Customs hold' },
  { value: 'OTHER',      emoji: '📝', label: 'Other' },
];

const HOUR_OPTIONS = [
  { value: 2,  label: '+2 hrs' },
  { value: 4,  label: '+4 hrs' },
  { value: 6,  label: '+6 hrs' },
  { value: 12, label: '+12 hrs' },
  { value: 24, label: '+1 day' },
  { value: 48, label: '+2 days' },
];

export default function ReportDelayInline({ trackingId, onSuccess, onCancel }) {
  const [reason,     setReason]     = useState('');
  const [customNote, setCustomNote] = useState('');
  const [hours,      setHours]      = useState(6);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const reasonLabel = reason === 'OTHER'
    ? customNote.trim()
    : REASONS.find(r => r.value === reason)?.label || '';

  const canSubmit = !!reason && (reason !== 'OTHER' || customNote.trim().length > 2);

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true); setError(null);
    try {
      await deliveryAPI.reportDelay({
        trackingId,
        reason: reasonLabel,
        additionalHours: hours,
      });
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to report delay.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      marginTop: 12,
      background: '#fffbeb',
      border: '1.5px solid #fcd34d',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
          ⏳ Report Delay
          <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 12, color: '#a16207' }}>
            {trackingId}
          </span>
        </div>
        <button onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1, padding: 0 }}>
          ✕
        </button>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 7, fontSize: 12, color: '#b91c1c', marginBottom: 10 }}>
          {error}
        </div>
      )}

      {/* Step 1 — Reason */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a16207', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          1. Reason
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {REASONS.map(r => {
            const selected = reason === r.value;
            return (
              <button key={r.value} onClick={() => setReason(r.value)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${selected ? '#f59e0b' : '#fde68a'}`,
                background: selected ? '#f59e0b' : '#fff',
                color: selected ? '#fff' : '#92400e',
                cursor: 'pointer', transition: 'all 0.12s',
              }}>
                <span>{r.emoji}</span> {r.label}
              </button>
            );
          })}
        </div>
        {reason === 'OTHER' && (
          <input
            autoFocus
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
            placeholder="Describe the reason..."
            style={{
              marginTop: 8, width: '100%', padding: '8px 11px',
              border: '1.5px solid #fcd34d', borderRadius: 8,
              fontSize: 13, color: '#1e4035', outline: 'none',
              boxSizing: 'border-box', background: '#fffdf5',
            }}
          />
        )}
      </div>

      {/* Step 2 — Additional hours */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a16207', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          2. Additional delay
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {HOUR_OPTIONS.map(h => {
            const selected = hours === h.value;
            return (
              <button key={h.value} onClick={() => setHours(h.value)} style={{
                padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${selected ? '#f59e0b' : '#fde68a'}`,
                background: selected ? '#f59e0b' : '#fff',
                color: selected ? '#fff' : '#92400e',
                cursor: 'pointer', transition: 'all 0.12s',
              }}>
                {h.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {reason && (
        <div style={{
          fontSize: 12, color: '#78350f', background: '#fef3c7',
          borderRadius: 7, padding: '8px 12px', marginBottom: 12, lineHeight: 1.5,
        }}>
          📋 <strong>{hours < 24 ? `${hours} hours` : `${hours / 24} day${hours > 24 ? 's' : ''}`}</strong> will
          be added to the expected delivery date.{' '}
          {reasonLabel && <>Reason: <strong>{reasonLabel}</strong>.</>}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '7px 16px', borderRadius: 8,
          border: '1px solid #e5e7eb', background: '#fff',
          fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 600,
        }}>
          Cancel
        </button>
        <button onClick={submit} disabled={!canSubmit || loading} style={{
          padding: '7px 18px', borderRadius: 8, border: 'none',
          background: canSubmit && !loading ? '#f59e0b' : '#fde68a',
          color: canSubmit && !loading ? '#fff' : '#b45309',
          fontSize: 13, fontWeight: 700,
          cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.12s',
        }}>
          {loading ? 'Submitting...' : '⏳ Confirm Delay'}
        </button>
      </div>
    </div>
  );
}