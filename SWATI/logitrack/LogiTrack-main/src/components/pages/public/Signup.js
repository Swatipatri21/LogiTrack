// import React, { useState } from 'react';
// import { Alert } from '../../ui';
// import { authAPI } from '../../../services/api';

// export default function Signup({ onBack, onLoginSuccess }) {
//   const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
//   const [alert, setAlert] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

//   const submit = async () => {
//     if (!form.name||!form.email||!form.password) { setAlert({ msg:'All fields required.', type:'danger' }); return; }
//     if (form.password !== form.confirm) { setAlert({ msg:'Passwords do not match.', type:'danger' }); return; }
//     if (form.password.length < 6) { setAlert({ msg:'Password must be at least 6 characters.', type:'danger' }); return; }
//     setLoading(true); setAlert(null);
//     try {
//       await authAPI.register({ name:form.name, email:form.email, password:form.password, role:'CUSTOMER' });
//       setAlert({ msg:'Account created! You can now sign in.', type:'success' });
//       setTimeout(() => onBack(), 1500);
//     } catch(err) {
//       setAlert({ msg: err?.response?.data?.message||'Registration failed. Try a different email.', type:'danger' });
//     }
//     setLoading(false);
//   };

//   const fieldStyle = { width:'100%', padding:'11px 14px', border:'1.5px solid #a7f3d0', borderRadius:9, fontSize:14, color:'#065f46', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color .15s' };

//   return (
//     <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0fdf9,#ecfdf5,#f0fdfa)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
//       <div style={{ position:'fixed', inset:0, backgroundImage:'radial-gradient(circle, #d1fae5 1px, transparent 1px)', backgroundSize:'30px 30px', opacity:.5, pointerEvents:'none' }} />
//       <div style={{ position:'relative', width:440, maxWidth:'95vw' }}>
//         <div style={{ background:'#fff', borderRadius:18, padding:'36px', boxShadow:'0 20px 60px rgba(6,95,70,.12)' }}>
//           <div style={{ textAlign:'center', marginBottom:26 }}>
//             <div style={{ width:54, height:54, background:'linear-gradient(135deg,#10b981,#059669)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 12px', boxShadow:'0 6px 18px rgba(16,185,129,.35)' }}>🚚</div>
//             <h1 style={{ fontSize:24, fontWeight:900, color:'#065f46', margin:'0 0 4px', letterSpacing:'-.4px' }}>Create Account</h1>
//             <p style={{ fontSize:13, color:'#4b7063', margin:0 }}>Join LogiTrack to track & manage shipments</p>
//           </div>
//           {alert && <div style={{ marginBottom:14 }}><Alert message={alert.msg} type={alert.type} /></div>}
//           <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
//             {[['Full Name','name','text','Rajesh Kumar'],['Email','email','email','you@company.com'],['Password','password','password','Min 6 characters'],['Confirm Password','confirm','password','Re-enter password']].map(([label,key,type,ph])=>(
//               <div key={key}>
//                 <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1e4035', marginBottom:4 }}>{label}</label>
//                 <input type={type} value={form[key]} onChange={f(key)} placeholder={ph} style={fieldStyle}
//                   onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#a7f3d0'} />
//               </div>
//             ))}
//           </div>
//           <button onClick={submit} disabled={loading} style={{ width:'100%', marginTop:18, padding:'12px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:800, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading?.7:1, boxShadow:'0 4px 14px rgba(16,185,129,.3)' }}>
//             {loading ? 'Creating Account...' : '✓ Create Account'}
//           </button>
//           <div style={{ textAlign:'center', marginTop:14 }}>
//             <span style={{ fontSize:13, color:'#4b7063' }}>Already have an account? </span>
//             <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#059669', fontWeight:700, fontFamily:'inherit', textDecoration:'underline' }}>Sign In</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
