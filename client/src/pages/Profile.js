import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

const Profile = () => {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const token    = localStorage.getItem('token');

  const [profile,       setProfile]       = useState(null);
  const [form,          setForm]          = useState({});
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [photoPreview,  setPhotoPreview]  = useState(null);
  const [bookings,      setBookings]      = useState([]);
  const [bookLoading,   setBookLoading]   = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling,    setCancelling]    = useState(false);

  const loadBookings = () => {
    axios.get(`${API}/api/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => { setBookings(res.data); setBookLoading(false); })
      .catch(() => setBookLoading(false));
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get(`${API}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setProfile(res.data);
      setForm({
        firstName:     res.data.firstName     || '',
        lastName:      res.data.lastName      || '',
        phone:         res.data.phone         || '',
        driverLicense: res.data.driverLicense || '',
        profilePhoto:  res.data.profilePhoto  || '',
      });
      setPhotoPreview(res.data.profilePhoto || null);
      setLoading(false);
    }).catch(() => { navigate('/login'); });

    loadBookings();
  }, [token, navigate]);

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Compress image to max 300x300 before saving
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 300;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      setPhotoPreview(compressed);
      F('profilePhoto', compressed);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    setCancelling(true);
    try {
      await axios.post(`${API}/api/bookings/${cancelConfirm.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCancelConfirm(null);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel.');
    } finally { setCancelling(false); }
  };

  const handleSave = async () => {
    if (!form.firstName) return alert("First name is required.");
    setSaving(true);
    try {
      await axios.put(`${API}/api/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('userFirstName', form.firstName);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userFirstName');
    navigate('/login');
  };

  if (loading) return (
    <div style={S.wrapper}>
      <div style={S.center}>Loading profile...</div>
    </div>
  );

  const initials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div style={S.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        input::placeholder { color: #2a2a3e; }
        input:focus { border-bottom-color: #9b1c31 !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(155,28,49,0.4)} 50%{box-shadow:0 0 0 8px rgba(155,28,49,0)} }
      `}</style>

      <div style={S.container}>

        {/* ── LEFT: Avatar + Info ── */}
        <div style={S.left}>
          <div style={S.topAccent}/>

          {/* Avatar */}
          <div style={S.avatarSection}>
            <div style={S.avatarWrap} onClick={() => fileRef.current.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={S.avatarImg}/>
                : <div style={S.avatarInitials}>{initials || '?'}</div>
              }
              <div style={S.avatarOverlay}>
                <span style={{ fontSize:'1.2rem' }}>📷</span>
                <span style={{ fontSize:'.6rem', letterSpacing:'2px', marginTop:'4px' }}>CHANGE</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoChange}/>

            <h2 style={S.profileName}>{form.firstName} {form.lastName}</h2>
            <p style={S.profileEmail}>{profile?.email}</p>

            {profile?.isAdmin && (
              <span style={S.adminBadge}>⚙️ ADMIN</span>
            )}
          </div>

          {/* Quick stats */}
          <div style={S.statsSection}>
            <div style={S.statItem}>
              <span style={S.statLabel}>MEMBER SINCE</span>
              <span style={S.statValue}>2026</span>
            </div>
            <div style={S.statDivider}/>
            <div style={S.statItem}>
              <span style={S.statLabel}>LICENSE</span>
              <span style={S.statValue}>{form.driverLicense ? '✓ ON FILE' : '— MISSING'}</span>
            </div>
          </div>

          <button style={S.btnLogout} onClick={handleLogout}>SIGN OUT</button>
        </div>

        {/* ── RIGHT: Edit Form ── */}
        <div style={S.right}>
          <div style={S.rightTopAccent}/>

          <div style={S.formHeader}>
            <h1 style={S.formTitle}>MY PROFILE</h1>
            <p style={S.formSubtitle}>Manage your personal information</p>
          </div>

          <div style={S.formGrid}>
            {/* First Name */}
            <div style={S.field}>
              <label style={S.lbl}>FIRST NAME *</label>
              <input style={S.inp} value={form.firstName} onChange={e => F('firstName', e.target.value)} placeholder="John"/>
            </div>
            {/* Last Name */}
            <div style={S.field}>
              <label style={S.lbl}>LAST NAME</label>
              <input style={S.inp} value={form.lastName} onChange={e => F('lastName', e.target.value)} placeholder="Doe"/>
            </div>
            {/* Email (read-only) */}
            <div style={{ ...S.field, gridColumn:'1 / -1' }}>
              <label style={S.lbl}>EMAIL ADDRESS</label>
              <input style={{ ...S.inp, color:'#4a5060', cursor:'not-allowed' }} value={profile?.email || ''} readOnly/>
              <span style={{ fontSize:'.6rem', color:'#3a3a50', letterSpacing:'1px', marginTop:'4px' }}>Email cannot be changed</span>
            </div>
            {/* Phone */}
            <div style={S.field}>
              <label style={S.lbl}>PHONE NUMBER</label>
              <input style={S.inp} value={form.phone} onChange={e => F('phone', e.target.value)} placeholder="+1 (555) 000-0000"/>
            </div>
            {/* Driver License */}
            <div style={S.field}>
              <label style={S.lbl}>DRIVER'S LICENSE</label>
              <input style={S.inp} value={form.driverLicense} onChange={e => F('driverLicense', e.target.value)} placeholder="e.g. NY1234567"/>
            </div>
          </div>

          <div style={S.formDivider}/>

          {/* Photo URL alternative */}
          <div style={S.field}>
            <label style={S.lbl}>PROFILE PHOTO URL <span style={{ color:'#3a3a50' }}>(or upload above)</span></label>
            <input style={S.inp} value={form.profilePhoto} onChange={e => { F('profilePhoto', e.target.value); setPhotoPreview(e.target.value); }} placeholder="https://..."/>
          </div>

          {/* Save Button */}
          <button
            style={{ ...S.btnSave, opacity: saving ? .6 : 1, animation: saved ? 'pulse .6s ease' : 'none' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'SAVING...' : saved ? '✓ SAVED' : 'SAVE CHANGES'}
          </button>

          {saved && (
            <p style={{ color:'#4ade80', fontSize:'.72rem', letterSpacing:'2px', textAlign:'center', marginTop:'12px', animation:'fadeUp .3s ease' }}>
              Profile updated successfully.
            </p>
          )}
        </div>
      </div>

      {/* ── BOOKING HISTORY ── */}
      <div style={S.historySection}>
        <div style={S.historyHeader}>
          <div>
            <h2 style={S.historyTitle}>MY RESERVATIONS</h2>
            <p style={S.historySub}>Your complete rental history</p>
          </div>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', color:'#9b1c31', fontWeight:700 }}>
            {bookings.length}
          </span>
        </div>

        {bookLoading ? (
          <p style={{ color:'#4a5060', letterSpacing:'3px', fontSize:'.75rem', textAlign:'center', padding:'40px' }}>LOADING...</p>
        ) : bookings.length === 0 ? (
          <div style={S.emptyHistory}>
            <span style={{ fontSize:'2rem', marginBottom:'12px' }}>🚗</span>
            <p style={{ color:'#4a5060', letterSpacing:'3px', fontSize:'.75rem' }}>NO RESERVATIONS YET</p>
          </div>
        ) : (
          <div style={S.bookingsList}>
            {bookings.map(b => {
              const start     = new Date(b.startDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
              const end       = new Date(b.endDate).toLocaleDateString('en-US',   { month:'short', day:'numeric', year:'numeric' });
              const isCancellable = ['pending','confirmed'].includes(b.status) && new Date(b.startDate) > new Date();
              const statusColor = {
                confirmed:'#4ade80', pending:'#fbbf24', cancelled:'#f87171',
                active:'#a78bfa', completed:'#c8cdd6'
              }[b.status] || '#6b7280';

              return (
                <div key={b.id} style={S.bookingCard}>
                  {/* Car image */}
                  <div style={{ width:'100px', minWidth:'100px', height:'70px', borderRadius:'3px', overflow:'hidden', border:'1px solid #1e1e2e' }}>
                    <img src={b.imageUrl || `https://placehold.co/100x70/0e0e14/4a5060?text=${b.make}`}
                      alt={b.model} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => e.target.src=`https://placehold.co/100x70/0e0e14/4a5060?text=${b.make}`}/>
                  </div>

                  {/* Main info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', color:'#f0f2f8', fontWeight:700 }}>
                        {b.year} {b.make} {b.model}
                      </span>
                      <span style={{ background:`${statusColor}18`, border:`1px solid ${statusColor}44`, color:statusColor, fontSize:'.55rem', fontWeight:700, letterSpacing:'2px', padding:'2px 8px', borderRadius:'2px' }}>
                        {b.status?.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color:'#4a5060', fontSize:'.68rem', letterSpacing:'1px', margin:'0 0 6px' }}>
                      📅 {start} → {end}
                    </p>
                    <p style={{ color:'#3a3a50', fontSize:'.62rem', letterSpacing:'2px', margin:0, fontFamily:'monospace' }}>
                      {b.confirmationNumber}
                    </p>
                  </div>

                  {/* Amount + cancel */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px', minWidth:'100px' }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', color:'#f0f2f8', fontWeight:700 }}>
                      ${Number(b.totalAmount).toFixed(2)}
                    </span>
                    {isCancellable && (
                      <button style={S.cancelBtn} onClick={() => setCancelConfirm(b)}>
                        CANCEL
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CANCEL CONFIRM MODAL ── */}
      {cancelConfirm && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setCancelConfirm(null); }}>
          <div style={S.modal}>
            <div style={S.modalAccent}/>
            <div style={{ fontSize:'2rem', textAlign:'center', marginBottom:'12px' }}>⚠️</div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:'#f0f2f8', fontSize:'1.5rem', letterSpacing:'3px', textAlign:'center', margin:'0 0 12px' }}>
              CANCEL RESERVATION
            </h3>
            <p style={{ color:'#6a7080', fontSize:'.82rem', textAlign:'center', lineHeight:1.7, marginBottom:'8px' }}>
              {cancelConfirm.year} {cancelConfirm.make} {cancelConfirm.model}
            </p>
            <p style={{ color:'#3a3a50', fontSize:'.72rem', textAlign:'center', fontFamily:'monospace', letterSpacing:'2px', marginBottom:'24px' }}>
              {cancelConfirm.confirmationNumber}
            </p>
            <p style={{ color:'#f87171', fontSize:'.72rem', textAlign:'center', letterSpacing:'1px', marginBottom:'24px' }}>
              This action cannot be undone.
            </p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button
                style={{ flex:1, background:'rgba(155,28,49,0.2)', border:'1px solid rgba(248,113,113,0.4)', color:'#f87171', padding:'12px', borderRadius:'3px', cursor:'pointer', fontSize:'.7rem', fontWeight:700, letterSpacing:'3px', fontFamily:"'Montserrat',sans-serif", opacity: cancelling ? .6 : 1 }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'CANCELLING...' : 'YES, CANCEL'}
              </button>
              <button
                style={{ flex:1, background:'transparent', border:'1px solid #1e1e2e', color:'#c8cdd6', padding:'12px', borderRadius:'3px', cursor:'pointer', fontSize:'.7rem', fontWeight:700, letterSpacing:'3px', fontFamily:"'Montserrat',sans-serif" }}
                onClick={() => setCancelConfirm(null)}
              >
                KEEP IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  wrapper:       { background:'#050508', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'40px 24px', fontFamily:"'Montserrat',sans-serif" },
  container:     { display:'grid', gridTemplateColumns:'300px 1fr', gap:'2px', width:'100%', maxWidth:'920px', borderRadius:'6px', overflow:'hidden', border:'1px solid #1e1e2e', boxShadow:'0 0 80px rgba(155,28,49,0.1), 0 40px 80px rgba(0,0,0,0.8)' },
  center:        { color:'#4a5060', textAlign:'center', padding:'100px', letterSpacing:'3px' },

  // Left panel
  left:          { background:'#0e0e14', padding:'48px 32px', display:'flex', flexDirection:'column', alignItems:'center', gap:'24px', position:'relative', borderRight:'1px solid #1e1e2e' },
  topAccent:     { position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg, transparent, #9b1c31, transparent)' },
  avatarSection: { display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', width:'100%' },
  avatarWrap:    { width:'100px', height:'100px', borderRadius:'50%', border:'2px solid #9b1c31', cursor:'pointer', position:'relative', overflow:'hidden', boxShadow:'0 0 30px rgba(155,28,49,0.3)' },
  avatarImg:     { width:'100%', height:'100%', objectFit:'cover' },
  avatarInitials:{ width:'100%', height:'100%', background:'linear-gradient(135deg,#9b1c31,#5c0f20)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:'2.2rem', fontWeight:700, color:'#f0f2f8' },
  avatarOverlay: { position:'absolute', inset:0, background:'rgba(5,5,8,0.7)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#f0f2f8', opacity:0, transition:'opacity .2s', ':hover':{ opacity:1 } },
  profileName:   { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', fontWeight:600, color:'#f0f2f8', letterSpacing:'2px', textAlign:'center', margin:0 },
  profileEmail:  { fontSize:'.68rem', color:'#4a5060', letterSpacing:'1px', textAlign:'center', margin:0 },
  adminBadge:    { background:'rgba(155,28,49,0.15)', border:'1px solid rgba(155,28,49,0.4)', color:'#9b1c31', fontSize:'.6rem', letterSpacing:'2px', padding:'4px 12px', borderRadius:'2px', fontWeight:700 },
  statsSection:  { width:'100%', background:'#13131c', border:'1px solid #1e1e2e', borderRadius:'4px', padding:'16px 20px', display:'flex', gap:'16px', alignItems:'center', justifyContent:'center' },
  statItem:      { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' },
  statLabel:     { fontSize:'.55rem', color:'#4a5060', letterSpacing:'2px', fontWeight:700 },
  statValue:     { fontSize:'.78rem', color:'#c8cdd6', fontWeight:600, letterSpacing:'1px' },
  statDivider:   { width:'1px', height:'28px', background:'#1e1e2e' },
  btnLogout:     { marginTop:'auto', background:'transparent', border:'1px solid #1e1e2e', color:'#4a5060', padding:'10px 24px', borderRadius:'2px', cursor:'pointer', fontSize:'.65rem', letterSpacing:'3px', fontFamily:"'Montserrat',sans-serif", fontWeight:700, transition:'all .2s', width:'100%' },

  // Right panel
  right:         { background:'#13131c', padding:'48px 44px', position:'relative' },
  rightTopAccent:{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg, transparent, rgba(155,28,49,0.5), #c8cdd6, rgba(155,28,49,0.5), transparent)' },
  formHeader:    { marginBottom:'32px' },
  formTitle:     { fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', color:'#f0f2f8', letterSpacing:'5px', margin:'0 0 4px' },
  formSubtitle:  { color:'#4a5060', fontSize:'.65rem', letterSpacing:'2px', textTransform:'uppercase' },
  formGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px 32px', marginBottom:'24px' },
  field:         { display:'flex', flexDirection:'column', gap:'8px' },
  lbl:           { fontSize:'.6rem', color:'#4a5060', letterSpacing:'3px', fontWeight:700, textTransform:'uppercase' },
  inp:           { background:'transparent', border:'none', borderBottom:'1px solid #1e1e2e', color:'#f0f2f8', padding:'10px 0', fontSize:'.9rem', fontFamily:"'Montserrat',sans-serif", outline:'none', transition:'border-color .2s', letterSpacing:'.5px' },
  formDivider:   { height:'1px', background:'linear-gradient(90deg,transparent,#1e1e2e,transparent)', margin:'8px 0 24px' },
  btnSave:       { width:'100%', background:'linear-gradient(135deg,#9b1c31,#7a1526)', border:'none', borderRadius:'2px', color:'#f0f2f8', fontWeight:700, fontSize:'.72rem', letterSpacing:'4px', padding:'14px', cursor:'pointer', fontFamily:"'Montserrat',sans-serif", boxShadow:'0 4px 24px rgba(155,28,49,0.4)', transition:'all .3s', marginTop:'8px' },

  // Booking history
  historySection:{ width:'100%', maxWidth:'920px', marginTop:'24px', border:'1px solid #1e1e2e', borderRadius:'6px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' },
  historyHeader: { background:'#0e0e14', padding:'24px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e1e2e' },
  historyTitle:  { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', letterSpacing:'4px', color:'#f0f2f8', margin:0 },
  historySub:    { color:'#4a5060', fontSize:'.6rem', letterSpacing:'2px', margin:'4px 0 0', textTransform:'uppercase' },
  bookingsList:  { background:'#0e0e14' },
  bookingCard:   { display:'flex', alignItems:'center', gap:'20px', padding:'20px 32px', borderBottom:'1px solid #1e1e2e', transition:'background .15s' },
  emptyHistory:  { background:'#0e0e14', padding:'60px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' },
  cancelBtn:     { background:'transparent', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', padding:'5px 12px', borderRadius:'2px', cursor:'pointer', fontSize:'.58rem', fontWeight:700, letterSpacing:'2px', fontFamily:"'Montserrat',sans-serif", transition:'all .2s' },

  // Cancel modal
  overlay:       { position:'fixed', inset:0, background:'rgba(5,5,8,0.9)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  modal:         { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'4px', padding:'36px', width:'100%', maxWidth:'400px', position:'relative' },
  modalAccent:   { position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#9b1c31,transparent)', borderRadius:'4px 4px 0 0' },
};

// Avatar hover fix (inline style can't do :hover, use onMouse)
const AvatarWithHover = ({ children, ...props }) => {
  const [hov, setHov] = useState(false);
  return (
    <div {...props} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {React.Children.map(children, (child, i) =>
        i === 1 ? React.cloneElement(child, { style: { ...child.props.style, opacity: hov ? 1 : 0 } }) : child
      )}
    </div>
  );
};

export default Profile;