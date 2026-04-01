import React, { useState } from 'react';
import { Alert } from '../../ui';

export default function Login({ onLogin, onBack, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // const doLogin = async (e, p) => {
  //   const em = e||email; const pw = p||password;
  //   if (!em||!pw) { setAlert({ msg:'Please enter email and password.', type:'danger' }); return; }
  //   setLoading(true); setAlert(null);
  //   const result = await onLogin(em, pw);
  //   if (!result.success) setAlert({ msg: result.error||'Login failed.', type:'danger' });
  //   setLoading(false);
  // };

const doLogin = async (e, p) => {
  const em = e || email;
  const pw = p || password;

  // Client-side guard clauses
  if (!em) return setAlert({ msg: 'Email is required.', type: 'danger' });
  if (!pw) return setAlert({ msg: 'Password is required.', type: 'danger' });

  setLoading(true);
  setAlert(null);

  try {
    const result = await onLogin(em, pw);

    if (result.success) {
      // Handle successful login (e.g., redirect or update context)
    } else {
      // SPECIFIC ERROR HANDLING
      // This assumes your backend returns result.error as a string like "User not found" 
      // or result.code as something like "auth/wrong-password"
      
      let errorMessage = 'Login failed.';

      if (result.error?.includes('user') || result.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (result.error?.includes('password') || result.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else {
        errorMessage = result.error || 'An unexpected error occurred.';
      }

      setAlert({ msg: errorMessage, type: 'danger' });
    }
  } catch (err) {
    setAlert({ msg: 'Network error. Please check your connection.', type: 'danger' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0fdf9 0%,#ecfdf5 50%,#f0fdfa 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ position:'fixed', inset:0, backgroundImage:'radial-gradient(circle, #d1fae5 1px, transparent 1px)', backgroundSize:'30px 30px', opacity:.5, pointerEvents:'none' }} />
      <div style={{ position:'relative', width:440, maxWidth:'95vw' }}>
        {/* Card */}
        <div style={{ background:'#fff', borderRadius:18, padding:'40px 36px', boxShadow:'0 20px 60px rgba(6,95,70,.12), 0 0 0 1px rgba(16,185,129,.1)' }}>
          {/* Brand */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ width:58, height:58, background:'linear-gradient(135deg,#10b981,#059669)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(16,185,129,.35)' }}>🚚</div>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#065f46', margin:'0 0 5px', letterSpacing:'-.5px' }}>Welcome Back</h1>
            <p style={{ fontSize:13, color:'#4b7063', margin:0 }}>Sign in to LogiTrack Platform</p>
          </div>

          {alert && <div style={{ marginBottom:16 }}><Alert message={alert.msg} type={alert.type} /></div>}

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1e4035', marginBottom:5 }}>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="you@company.com"
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #a7f3d0', borderRadius:9, fontSize:14, color:'#065f46', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color .15s' }}
              onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#a7f3d0'} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1e4035', marginBottom:5 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="••••••••"
                style={{ width:'100%', padding:'11px 42px 11px 14px', border:'1.5px solid #a7f3d0', borderRadius:9, fontSize:14, color:'#065f46', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color .15s' }}
                onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#a7f3d0'} />
              <button onClick={()=>setShowPwd(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#4b7063', fontSize:16 }}>{showPwd?'🙈':'👁'}</button>
            </div>
          </div>

          <button onClick={()=>doLogin()} disabled={loading} style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:800, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading?.7:1, boxShadow:'0 4px 14px rgba(16,185,129,.3)', letterSpacing:'.2px' }}>
            {loading ? 'Signing in...' : '→ Sign In'}
          </button>

          {/* <div style={{ textAlign:'center', marginTop:16 }}>
            <span style={{ fontSize:13, color:'#4b7063' }}>Don't have an account? </span>
            <button onClick={onSignup} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#059669', fontWeight:700, fontFamily:'inherit', textDecoration:'underline' }}>Sign Up</button>
          </div> */}

          <div style={{ height:1, background:'#d1fae5', margin:'18px 0' }} />
          <button onClick={onBack} style={{ width:'100%', padding:'11px', background:'#f0fdf9', color:'#047857', border:'1.5px solid #a7f3d0', borderRadius:10, fontSize:13.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            🔍 Track a Shipment 
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:16 }}>
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12.5, color:'#4b7063', fontFamily:'inherit' }}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}
