import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/api/admin/login`, { adminPassword: password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/fleet');
    } catch {
      setShake(true);
      setError('Invalid password. Access denied.');
      setTimeout(() => setShake(false), 600);
      setPassword('');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.wrapper}>
      <div style={S.bg}/>
      <div style={S.grid}/>

      {/* Decorative lines */}
      <div style={S.lineH}/>
      <div style={S.lineV}/>

      <div style={{ ...S.card, animation: shake ? 'shake .5s ease' : 'fadeIn .4s ease' }}>
        {/* Top accent */}
        <div style={S.topAccent}/>

        <div style={S.logoWrap}>
          <div style={S.logoBox}>R</div>
          <span style={S.logoText}>RENTAL <span style={{ color:'#9b1c31' }}>10</span></span>
        </div>

        <div style={S.divider}/>

        <h1 style={S.title}>ADMIN ACCESS</h1>
        <p style={S.sub}>Restricted area — authorized personnel only</p>

        <form onSubmit={handleSubmit} style={{ width:'100%', marginTop:'8px' }}>
          <div style={S.inputWrap}>
            <span style={S.inputIcon}>⬡</span>
            <input
              type="password"
              placeholder="Enter access code"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={S.input}
              autoFocus required
            />
          </div>
          {error && <p style={S.errorMsg}>{error}</p>}
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'VERIFYING...' : 'GRANT ACCESS'}
          </button>
        </form>

        <p style={S.back} onClick={() => navigate('/catalog')}>← Return to Fleet</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;600;700;800&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-12px)} 40%{transform:translateX(12px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

const S = {
  wrapper:   { background:'#050508', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', fontFamily:"'Montserrat',sans-serif" },
  bg:        { position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%, rgba(155,28,49,0.08) 0%, transparent 70%)' },
  grid:      { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(155,28,49,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(155,28,49,0.05) 1px,transparent 1px)', backgroundSize:'60px 60px' },
  lineH:     { position:'absolute', top:'50%', left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(155,28,49,0.15),transparent)' },
  lineV:     { position:'absolute', left:'50%', top:0, bottom:0, width:'1px', background:'linear-gradient(180deg,transparent,rgba(155,28,49,0.1),transparent)' },
  card:      { position:'relative', zIndex:1, background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'4px', padding:'48px 44px', width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', boxShadow:'0 0 80px rgba(155,28,49,0.12), 0 40px 80px rgba(0,0,0,0.8)' },
  topAccent: { position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#9b1c31,#c8cdd6,#9b1c31,transparent)', borderRadius:'4px 4px 0 0' },
  logoWrap:  { display:'flex', alignItems:'center', gap:'12px', marginBottom:'4px' },
  logoBox:   { width:'38px', height:'38px', borderRadius:'6px', background:'linear-gradient(135deg,#9b1c31,#5c0f20)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', fontWeight:700, color:'#f0f2f8', boxShadow:'0 0 20px rgba(155,28,49,0.5)' },
  logoText:  { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', fontWeight:700, letterSpacing:'4px', color:'#f0f2f8' },
  divider:   { width:'40px', height:'1px', background:'linear-gradient(90deg,transparent,#9b1c31,transparent)', margin:'4px 0' },
  title:     { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', color:'#f0f2f8', margin:0, letterSpacing:'5px', textTransform:'uppercase', textAlign:'center' },
  sub:       { color:'#4a5060', fontSize:'.68rem', margin:0, letterSpacing:'1.5px', textAlign:'center', textTransform:'uppercase' },
  inputWrap: { position:'relative', width:'100%', marginBottom:'12px' },
  inputIcon: { position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#9b1c31', fontSize:'1rem' },
  input:     { width:'100%', background:'#13131c', border:'1px solid #2a2a3e', borderRadius:'3px', color:'#f0f2f8', padding:'14px 14px 14px 40px', fontSize:'14px', outline:'none', fontFamily:'monospace', letterSpacing:'4px', colorScheme:'dark', transition:'border-color .2s', boxSizing:'border-box' },
  btn:       { width:'100%', background:'linear-gradient(135deg,#9b1c31,#7a1526)', border:'none', borderRadius:'3px', color:'#f0f2f8', fontWeight:700, fontSize:'11px', padding:'14px', cursor:'pointer', letterSpacing:'3px', fontFamily:"'Montserrat',sans-serif", textTransform:'uppercase', boxShadow:'0 4px 20px rgba(155,28,49,0.4)', transition:'all .3s' },
  errorMsg:  { color:'#e8203a', fontSize:'.72rem', letterSpacing:'1px', textAlign:'center', margin:'-4px 0 8px' },
  back:      { color:'#3a3a50', fontSize:'.72rem', cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase', marginTop:'8px', transition:'color .2s' },
};

export default AdminLogin;