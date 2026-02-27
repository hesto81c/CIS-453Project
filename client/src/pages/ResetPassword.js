import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

const ResetPassword = () => {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const token             = searchParams.get('token');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [status,    setStatus]    = useState('idle'); // idle | loading | success | error
  const [message,   setMessage]   = useState('');

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2)
      return setMessage("Passwords don't match.");
    if (password.length < 6)
      return setMessage("Password must be at least 6 characters.");

    setStatus('loading');
    try {
      await axios.post(`${API}/api/reset/confirm`, { token, newPassword: password });
      setStatus('success');
      setMessage('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Reset failed. Please try again.');
    }
  };

  return (
    <div style={S.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;600;700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: #2a2a3e; }
      `}</style>

      <div style={S.card}>
        <div style={S.topAccent}/>

        <div style={S.logo}>
          <div style={S.logoBox}>R</div>
          <span style={S.logoText}>RENTAL <span style={{ color:'#9b1c31' }}>10</span></span>
        </div>

        <div style={S.divider}/>

        {status === 'success' ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>✓</div>
            <h2 style={S.title}>PASSWORD UPDATED</h2>
            <p style={{ color:'#4ade80', fontSize:'.75rem', letterSpacing:'1px', marginTop:'8px' }}>{message}</p>
          </div>
        ) : (
          <>
            <h2 style={S.title}>NEW PASSWORD</h2>
            <p style={S.subtitle}>Enter your new password below</p>

            <form onSubmit={handleSubmit} style={{ width:'100%' }}>
              <div style={S.field}>
                <label style={S.lbl}>NEW PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={S.inp}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
              <div style={S.field}>
                <label style={S.lbl}>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  style={S.inp}
                  placeholder="Repeat password"
                  required
                />
              </div>

              {message && (
                <p style={{ color: status === 'error' ? '#f87171' : '#c8cdd6', fontSize:'.72rem', letterSpacing:'1px', margin:'8px 0', textAlign:'center' }}>
                  {message}
                </p>
              )}

              <button type="submit" style={{ ...S.btn, opacity: status === 'loading' ? .6 : 1 }} disabled={status === 'loading'}>
                {status === 'loading' ? 'UPDATING...' : 'SET NEW PASSWORD'}
              </button>
            </form>
          </>
        )}

        <p style={S.back} onClick={() => navigate('/login')}>← Back to Login</p>
      </div>
    </div>
  );
};

const S = {
  wrapper:  { background:'#050508', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Montserrat',sans-serif", backgroundImage:'radial-gradient(ellipse at 50% 50%, rgba(155,28,49,0.07) 0%, transparent 70%)' },
  card:     { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'6px', padding:'48px 44px', width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', boxShadow:'0 0 80px rgba(155,28,49,0.12), 0 40px 80px rgba(0,0,0,0.8)', position:'relative', animation:'fadeIn .4s ease' },
  topAccent:{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#9b1c31,#c8cdd6,#9b1c31,transparent)', borderRadius:'6px 6px 0 0' },
  logo:     { display:'flex', alignItems:'center', gap:'12px' },
  logoBox:  { width:'36px', height:'36px', borderRadius:'6px', background:'linear-gradient(135deg,#9b1c31,#5c0f20)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', fontWeight:700, color:'#f0f2f8', boxShadow:'0 0 16px rgba(155,28,49,0.4)' },
  logoText: { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.2rem', fontWeight:700, letterSpacing:'4px', color:'#f0f2f8' },
  divider:  { width:'40px', height:'1px', background:'linear-gradient(90deg,transparent,#9b1c31,transparent)' },
  title:    { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', color:'#f0f2f8', letterSpacing:'5px', margin:0, textAlign:'center' },
  subtitle: { color:'#4a5060', fontSize:'.62rem', letterSpacing:'2px', textTransform:'uppercase', margin:0, textAlign:'center' },
  field:    { display:'flex', flexDirection:'column', gap:'6px', width:'100%', marginBottom:'16px' },
  lbl:      { fontSize:'.58rem', color:'#4a5060', letterSpacing:'3px', fontWeight:700, textTransform:'uppercase' },
  inp:      { background:'transparent', border:'none', borderBottom:'1px solid #1e1e2e', color:'#f0f2f8', padding:'10px 0', fontSize:'.9rem', outline:'none', fontFamily:"'Montserrat',sans-serif", transition:'border-color .2s', letterSpacing:'.5px' },
  btn:      { width:'100%', background:'linear-gradient(135deg,#9b1c31,#7a1526)', border:'none', borderRadius:'2px', color:'#f0f2f8', fontWeight:700, fontSize:'.68rem', letterSpacing:'4px', padding:'14px', cursor:'pointer', fontFamily:"'Montserrat',sans-serif", boxShadow:'0 4px 24px rgba(155,28,49,0.4)', transition:'all .3s' },
  back:     { color:'#3a3a50', fontSize:'.68rem', cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase', marginTop:'4px', transition:'color .2s' },
};

export default ResetPassword;