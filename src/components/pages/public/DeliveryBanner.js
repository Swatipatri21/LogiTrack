// import React from 'react';
// import { StatusBadge } from '../../ui';

// function formatDate(ts, opts = {}) {
//   if (!ts) return null;
//   return new Date(ts).toLocaleDateString('en-IN', {
//     day: 'numeric', month: 'short', year: 'numeric', ...opts,
//   });
// }

// function formatDateTime(ts) {
//   if (!ts) return null;
//   const d = new Date(ts);
//   return (
//     d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
//     ', ' +
//     d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
//   );
// }

// function dayDiff(a, b) {
//   if (!a || !b) return null;
//   return Math.round((new Date(b) - new Date(a)) / 86_400_000);
// }

// export function DeliveryBanner({ shipment }) {
//   const {
//     trackingId, currentStatus, origin, destination,
//     expectedDeliveryDate, revisedDeliveryDate,
//     delayed, delayReason, estimatedDaysMessage,
//   } = shipment || {};

//   const diff = dayDiff(expectedDeliveryDate, revisedDeliveryDate);

//   return (
//     <div style={{ marginBottom: 20 }}>

//       {/* ── Route + status row ── */}
//       <div style={{
//         background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
//         padding: '16px 20px', marginBottom: 10,
//       }}>
//         {/* top row */}
//         <div style={{
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8,
//         }}>
//           <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: 0.3 }}>
//             {trackingId}
//           </span>
//           <StatusBadge status={currentStatus} size="lg" />
//         </div>

//         {/* route bar */}
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: 10,
//           padding: '12px 16px', background: '#f8fafc',
//           borderRadius: 10, border: '1px solid #e2e8f0',
//         }}>
//           <div>
//             <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>From</div>
//             <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{origin}</div>
//           </div>

//           <div style={{ flex: 1, position: 'relative', height: 1, background: '#e2e8f0' }}>
//             <div style={{
//               position: 'absolute', top: '50%', left: '50%',
//               transform: 'translate(-50%, -50%)',
//               width: 26, height: 26, borderRadius: '50%',
//               background: delayed ? '#fffbeb' : '#f0fdf4',
//               border: `1.5px solid ${delayed ? '#fcd34d' : '#86efac'}`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//             }}>
//               <span style={{ fontSize: 13 }}>{delayed ? '⚠️' : '→'}</span>
//             </div>
//           </div>

//           <div style={{ textAlign: 'right' }}>
//             <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>To</div>
//             <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{destination}</div>
//           </div>
//         </div>

//         {/* ── Delay notice (inline, below route) ── */}
//         {delayed && (
//           <div style={{
//             marginTop: 12, padding: '14px 16px',
//             background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a',
//           }}>
//             {/* header */}
//             <div style={{
//               display: 'flex', alignItems: 'flex-start',
//               justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
//             }}>
//               <div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
//                   ⏳ Shipment delayed{delayReason ? ` — ${delayReason}` : ''}
//                 </div>
//                 {estimatedDaysMessage && (
//                   <div style={{ fontSize: 12, color: '#b45309', marginTop: 3 }}>
//                     {estimatedDaysMessage}
//                   </div>
//                 )}
//               </div>
//               {diff > 0 && (
//                 <span style={{
//                   fontSize: 11, fontWeight: 700, padding: '3px 10px',
//                   borderRadius: 99, background: '#fef3c7',
//                   border: '1px solid #fcd34d', color: '#92400e',
//                 }}>
//                   +{diff} day{diff !== 1 ? 's' : ''}
//                 </span>
//               )}
//             </div>

//             {/* dates row */}
//             {(expectedDeliveryDate || revisedDeliveryDate) && (
//               <div style={{
//                 display: 'flex', gap: 16, marginTop: 12,
//                 flexWrap: 'wrap', alignItems: 'center',
//               }}>
//                 {expectedDeliveryDate && (
//                   <div>
//                     <div style={{ fontSize: 10.5, color: '#b45309', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Original</div>
//                     <div style={{
//                       fontSize: 13, fontWeight: 600, color: '#92400e',
//                       textDecoration: 'line-through', opacity: 0.6,
//                     }}>
//                       {formatDate(expectedDeliveryDate)}
//                     </div>
//                   </div>
//                 )}

//                 {revisedDeliveryDate && (
//                   <>
//                     <div style={{ width: 1, background: '#fcd34d', alignSelf: 'stretch', minHeight: 28 }} />
//                     <div>
//                       <div style={{ fontSize: 10.5, color: '#b45309', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Revised</div>
//                       <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
//                         {formatDateTime(revisedDeliveryDate)}
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── Non-delayed: show expected delivery cleanly ── */}
//         {!delayed && expectedDeliveryDate && (
//           <div style={{
//             marginTop: 12, padding: '12px 16px',
//             background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0',
//             display: 'flex', alignItems: 'center', gap: 10,
//           }}>
//             <span style={{ fontSize: 18 }}>📅</span>
//             <div>
//               <div style={{ fontSize: 10.5, color: '#166534', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>Expected delivery</div>
//               <div style={{ fontSize: 14, fontWeight: 700, color: '#14532d' }}>
//                 {new Date(expectedDeliveryDate).toLocaleDateString('en-IN', {
//                   weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
//                 })}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }