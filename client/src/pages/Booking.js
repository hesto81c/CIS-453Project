import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';
const NY_SALES_TAX    = 0.08875;
const AIRPORT_FEE     = 25.00;
const ONE_WAY_FEE     = 35.00;
const INSURANCE_DAILY = 19.99;

const toDateStr = (d) => d.toISOString().split('T')[0];
const getDays   = (s, e) => (!s || !e) ? 0 : Math.max(1, Math.ceil((e - s) / 86400000));
const isSameDay = (a, b) => toDateStr(a) === toDateStr(b);
const isInRange = (d, s, e) => s && e && d > s && d < e;
const inRanges  = (d, ranges) => { const ds = toDateStr(d); return ranges.some(r => ds >= r.startDate && ds <= r.endDate); };
const fmt = (n) => `$${Number(n).toFixed(2)}`;

// ── Calendar ─────────────────────────────────────────────────
const Calendar = ({ bookedRanges, startDate, endDate, onSelectDate }) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return (
    <div style={{background:'#13131c',border:'1px solid #1e1e2e',borderRadius:'14px',padding:'20px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <button style={{background:'none',border:'1px solid #1e1e2e',color:'#9b1c31',width:'30px',height:'30px',borderRadius:'6px',cursor:'pointer',fontSize:'1.2rem'}} onClick={() => setView(new Date(year,month-1,1))}>‹</button>
        <span style={{fontWeight:700,fontSize:'1rem',color:'#f0f2f8',letterSpacing:'1px'}}>{view.toLocaleString('en-US',{month:'long',year:'numeric'})}</span>
        <button style={{background:'none',border:'1px solid #1e1e2e',color:'#9b1c31',width:'30px',height:'30px',borderRadius:'6px',cursor:'pointer',fontSize:'1.2rem'}} onClick={() => setView(new Date(year,month+1,1))}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px'}}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{textAlign:'center',fontSize:'.7rem',color:'#6a7080',padding:'6px 0',fontWeight:600}}>{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`}/>;
          const isBooked = inRanges(date, bookedRanges);
          const disabled = date < today || isBooked;
          const isStart  = startDate && isSameDay(date, startDate);
          const isEnd    = endDate && isSameDay(date, endDate);
          const inRange  = isInRange(date, startDate, endDate);
          let bg='transparent', color=disabled?'#3a3a4a':'#f0f2f8', radius='8px', cursor=disabled?'not-allowed':'pointer';
          if (inRange)           { bg='rgba(155,28,49,0.12)'; color='#c8cdd6'; radius='0'; }
          if (isStart)           { bg='#9b1c31'; color='#fff'; radius=isEnd?'8px':'8px 0 0 8px'; }
          if (isEnd && !isStart) { bg='#9b1c31'; color='#fff'; radius='0 8px 8px 0'; }
          if (isBooked)          { bg='#1a0a0a'; color='#4a2a2a'; }
          return <div key={i} style={{textAlign:'center',padding:'8px 4px',fontSize:'.85rem',fontWeight:500,userSelect:'none',background:bg,color,borderRadius:radius,cursor}} onClick={() => !disabled && onSelectDate(date)}>{isBooked?<span style={{fontSize:'.6rem',opacity:.5}}>✕</span>:date.getDate()}</div>;
        })}
      </div>
      <div style={{display:'flex',gap:'16px',marginTop:'14px',fontSize:'.72rem',color:'#6a7080',flexWrap:'wrap'}}>
        <span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'3px',marginRight:'5px',background:'#9b1c31'}}/> Selected</span>
        <span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'3px',marginRight:'5px',background:'rgba(155,28,49,0.12)',border:'1px solid #9b1c3155'}}/> Range</span>
        <span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'3px',marginRight:'5px',background:'#1a0a0a'}}/> Unavailable</span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
const Booking = () => {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const cameFrom = searchParams.get('from') || 'catalog';

  const handleBack = () => {
    if (cameFrom === 'details') navigate(`/details/${vehicleId}`);
    else navigate('/catalog');
  };

  // ── Auth state ────────────────────────────────────────────
  const token  = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const isLoggedIn = !!token && !!userId;

  // Debug: log what we find (remove after testing)
  console.log('[Booking] token:', token ? 'YES' : 'NO', '| userId:', userId || 'NONE', '| isLoggedIn:', isLoggedIn);

  // 'logged-in' | 'guest' | 'choose'  (choose = prompt shown)
  const [authMode, setAuthMode] = useState(isLoggedIn ? 'logged-in' : 'choose');

  // ── Vehicle / booking data ────────────────────────────────
  const [car,          setCar]          = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [locations,    setLocations]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);

  // ── Dates / location ──────────────────────────────────────
  const [startDate,   setStartDate]   = useState(null);
  const [endDate,     setEndDate]     = useState(null);
  const [pickupLoc,   setPickupLoc]   = useState('');
  const [dropoffLoc,  setDropoffLoc]  = useState('');
  const [pickupTime,  setPickupTime]  = useState('10:00');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [addInsurance,setAddInsurance]= useState(false);
  const [paymentMethod,setPaymentMethod]=useState('credit_card');
  const [notes, setNotes] = useState('');

  // ── Driver info (shared for both flows) ───────────────────
  const [driverFirst,   setDriverFirst]   = useState('');
  const [driverLast,    setDriverLast]    = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverPhone,   setDriverPhone]   = useState('');
  const [driverEmail,   setDriverEmail]   = useState('');

  // ── Guest-only extra fields ───────────────────────────────
  const [guestAddress, setGuestAddress] = useState('');
  const [guestSSN4,    setGuestSSN4]    = useState(''); // last 4 digits only

  // ── Load vehicle + dates + locations ─────────────────────
  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/cars/${vehicleId}`),
      axios.get(`${API}/api/bookings/booked-dates/${vehicleId}`),
      axios.get(`${API}/api/bookings/locations`),
    ]).then(([carRes, datesRes, locsRes]) => {
      setCar(carRes.data);
      setBookedRanges(datesRes.data.map(r => ({
        startDate: toDateStr(new Date(r.startDate)),
        endDate:   toDateStr(new Date(r.endDate)),
      })));
      setLocations(locsRes.data);
      if (locsRes.data.length > 0) {
        setPickupLoc(locsRes.data[0].id);
        setDropoffLoc(locsRes.data[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [vehicleId]);

  // ── Pre-fill from profile if logged in ───────────────────
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    axios.get(`${API}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const p = res.data;
      console.log('[Booking] Profile loaded:', p.firstName, p.lastName, p.email);
      if (p.firstName)   setDriverFirst(p.firstName);
      if (p.lastName)    setDriverLast(p.lastName);
      if (p.phone)       setDriverPhone(p.phone);
      if (p.email)       setDriverEmail(p.email);
      if (p.driverLicense) setDriverLicense(p.driverLicense);
    }).catch(err => {
      console.error('[Booking] Profile fetch failed:', err.response?.status, err.message);
      // Fallback: use name from localStorage if stored
      const storedName = localStorage.getItem('userFirstName');
      if (storedName) setDriverFirst(storedName);
    });
  }, [isLoggedIn, token]);

  // ── Calendar handler ──────────────────────────────────────
  const handleSelectDate = useCallback((date) => {
    if (!startDate || (startDate && endDate)) { setStartDate(date); setEndDate(null); }
    else {
      if (date <= startDate) { setStartDate(date); setEndDate(null); }
      else {
        const conflict = bookedRanges.some(r => {
          const rd = new Date(r.startDate);
          return rd >= startDate && rd <= date;
        });
        if (conflict) { alert("Range includes unavailable dates. Please select again."); setStartDate(date); setEndDate(null); }
        else setEndDate(date);
      }
    }
  }, [startDate, endDate, bookedRanges]);

  // ── Price calculations ────────────────────────────────────
  const days         = getDays(startDate, endDate);
  const subtotal     = car ? days * parseFloat(car.dailyRate) : 0;
  const pickupLocObj = locations.find(l => l.id === pickupLoc);
  const isAirport    = pickupLocObj?.name?.toLowerCase().includes('airport');
  const isOneWay     = pickupLoc && dropoffLoc && pickupLoc !== dropoffLoc;
  const airportFee   = isAirport ? AIRPORT_FEE : 0;
  const oneWayFee    = isOneWay  ? ONE_WAY_FEE : 0;
  const insuranceFee = addInsurance ? INSURANCE_DAILY * days : 0;
  const feesTotal    = airportFee + oneWayFee + insuranceFee;
  const taxAmount    = (subtotal + feesTotal) * NY_SALES_TAX;
  const grandTotal   = (subtotal + feesTotal + taxAmount).toFixed(2);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!startDate || !endDate) return alert("Please select your rental dates.");
    if (!pickupLoc || !dropoffLoc) return alert("Please select pickup and dropoff locations.");
    if (!driverFirst || !driverLast) return alert("Please enter the driver's name.");
    if (!driverLicense) return alert("Please enter the driver's license number.");
    if (!driverPhone) return alert("Please enter a contact phone number.");

    if (authMode === 'guest') {
      if (!guestAddress) return alert("Please enter your address.");
      if (!guestSSN4 || guestSSN4.length !== 4) return alert("Please enter the last 4 digits of your SSN.");
      if (!driverEmail) return alert("Please enter your email address.");
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId,
        userId: isLoggedIn ? userId : null,
        startDate: toDateStr(startDate), endDate: toDateStr(endDate),
        pickupLocationId: pickupLoc, dropoffLocationId: dropoffLoc,
        pickupTime, dropoffTime,
        totalAmount: parseFloat(grandTotal), subtotal, airportFee, oneWayFee,
        insuranceFee, taxAmount: parseFloat(taxAmount.toFixed(2)), paymentMethod,
        driverFirst, driverLast, driverLicense, driverPhone, driverEmail, notes,
        // Guest extras
        guestAddress: authMode === 'guest' ? guestAddress : null,
        guestSSN4:    authMode === 'guest' ? guestSSN4    : null,
        isGuest:      authMode === 'guest',
      };

      const headers = isLoggedIn ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API}/api/bookings`, payload, { headers });
      navigate(`/payment/${res.data.bookingId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login', { state: { from: location.pathname } });
      } else {
        alert(err.response?.data?.error || "Booking failed. Please try again.");
      }
    } finally { setSubmitting(false); }
  };

  // ── Styles ────────────────────────────────────────────────
  const S = {
    wrapper: {background:'#050508',minHeight:'100vh',padding:'40px 30px',fontFamily:"'Montserrat',sans-serif"},
    layout:  {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'1100px',margin:'0 auto'},
    col:     {display:'flex',flexDirection:'column',gap:'20px'},
    card:    {background:'#0e0e14',border:'1px solid #1e1e2e',borderRadius:'16px',padding:'24px'},
    sec:     {margin:'0 0 14px',fontSize:'.7rem',fontWeight:700,letterSpacing:'3px',color:'#6a7080',paddingBottom:'10px',borderBottom:'1px solid #1e1e2e'},
    row:     {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'},
    field:   {display:'flex',flexDirection:'column',gap:'6px'},
    lbl:     {fontSize:'.65rem',color:'#6a7080',letterSpacing:'2px',fontWeight:700,textTransform:'uppercase'},
    inp:     {background:'#050508',border:'1px solid #1e1e2e',borderRadius:'8px',color:'#f0f2f8',padding:'10px 12px',fontSize:'.88rem',fontFamily:'inherit',outline:'none',colorScheme:'dark',transition:'border-color .2s'},
    sum:     {display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:'.9rem',color:'#f0f2f8'},
  };

  if (loading) return <div style={{textAlign:'center',padding:'100px',color:'#9b1c31',fontFamily:"'Montserrat',sans-serif"}}><h2>LOADING...</h2></div>;
  if (!car)    return <div style={{textAlign:'center',padding:'100px',color:'#9b1c31',fontFamily:"'Montserrat',sans-serif"}}><h2>Vehicle not found.</h2></div>;

  // ── Auth choice screen (shown if not logged in, no mode chosen yet) ──
  if (authMode === 'choose') {
    return (
      <div style={{background:'#050508',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',fontFamily:"'Montserrat',sans-serif"}}>
        <div style={{background:'#0e0e14',border:'1px solid #1e1e2e',borderRadius:'16px',padding:'52px 40px',maxWidth:'480px',width:'100%',position:'relative',overflow:'hidden'}}>
          {/* top accent */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,#9b1c31,#c8cdd6,#9b1c31,transparent)'}}/>

          <div style={{textAlign:'center',marginBottom:'36px'}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:700,color:'#f0f2f8',letterSpacing:'4px',marginBottom:'8px'}}>
              RENTAL <span style={{color:'#9b1c31'}}>10</span>
            </div>
            <p style={{color:'#4a5060',fontSize:'.68rem',letterSpacing:'3px',margin:0}}>HOW WOULD YOU LIKE TO PROCEED?</p>
          </div>

          {/* Login option */}
          <button
            style={{width:'100%',background:'linear-gradient(135deg,#9b1c31,#7a1526)',border:'none',borderRadius:'10px',padding:'18px',color:'#f0f2f8',fontWeight:700,fontSize:'1rem',cursor:'pointer',letterSpacing:'2px',fontFamily:'inherit',boxShadow:'0 4px 20px rgba(155,28,49,0.4)',marginBottom:'14px'}}
            onClick={() => navigate('/login', { state: { from: location.pathname + location.search } })}
          >
            SIGN IN TO MY ACCOUNT
          </button>

          <div style={{textAlign:'center',color:'#3a3a50',fontSize:'.72rem',letterSpacing:'2px',margin:'8px 0'}}>OR</div>

          {/* Guest option */}
          <button
            style={{width:'100%',background:'transparent',border:'1px solid #1e1e2e',borderRadius:'10px',padding:'18px',color:'#c8cdd6',fontWeight:600,fontSize:'.9rem',cursor:'pointer',letterSpacing:'1px',fontFamily:'inherit',transition:'border-color .2s'}}
            onClick={() => setAuthMode('guest')}
          >
            CONTINUE AS GUEST
          </button>
          <p style={{color:'#3a3a50',fontSize:'.65rem',textAlign:'center',marginTop:'12px',letterSpacing:'1px',lineHeight:1.6}}>
            Guest checkout requires a valid driver's license and address for verification.
          </p>

          <div style={{borderTop:'1px solid #1e1e2e',marginTop:'28px',paddingTop:'20px',textAlign:'center'}}>
            <p style={{color:'#4a5060',fontSize:'.72rem',margin:'0 0 10px',letterSpacing:'1px'}}>Booking for:</p>
            <p style={{color:'#f0f2f8',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.3rem',margin:0,fontWeight:600}}>
              {car.year} {car.make} {car.model}
            </p>
            <p style={{color:'#9b1c31',fontSize:'.85rem',fontWeight:700,margin:'4px 0 0'}}>{fmt(parseFloat(car.dailyRate))}/day</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main booking form ─────────────────────────────────────
  return (
    <div style={S.wrapper}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={S.layout}>

        {/* ════ LEFT COLUMN ════ */}
        <div style={S.col}>

          {/* Header card */}
          <div style={S.card}>
            <button onClick={handleBack} style={{background:'none',border:'none',color:'#9b1c31',cursor:'pointer',fontWeight:700,padding:0,fontSize:'.82rem',letterSpacing:'2px',fontFamily:'inherit'}}>
              {cameFrom === 'details' ? '← BACK TO DETAILS' : '← BACK TO FLEET'}
            </button>
            <div style={{display:'flex',gap:'16px',alignItems:'center',marginTop:'14px'}}>
              <img src={car.imageUrl||`https://placehold.co/120x80/13131a/7a7a9a?text=${car.make}`} alt={car.model}
                style={{width:'120px',height:'80px',objectFit:'cover',borderRadius:'8px',flexShrink:0}}
                onError={e=>{e.target.src=`https://placehold.co/120x80/13131a/7a7a9a?text=${car.make}`;}}/>
              <div>
                <p style={{color:'#9b1c31',fontSize:'.65rem',fontWeight:700,letterSpacing:'3px',margin:'0 0 2px'}}>{car.make?.toUpperCase()}</p>
                <h2 style={{color:'#f0f2f8',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.8rem',margin:'0 0 4px'}}>{car.model}</h2>
                <p style={{color:'#6a7080',fontSize:'.82rem',margin:0}}>{car.year} · {car.transmission} · {car.fuelType}</p>
              </div>
            </div>

            {/* Auth mode indicator */}
            {authMode === 'guest' ? (
              <div style={{marginTop:'14px',background:'rgba(200,205,214,0.06)',border:'1px solid #1e1e2e',borderRadius:'8px',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{color:'#c8cdd6',fontSize:'.75rem',letterSpacing:'1px'}}>👤 Continuing as <strong>Guest</strong></span>
                <button style={{background:'none',border:'none',color:'#9b1c31',cursor:'pointer',fontSize:'.7rem',fontWeight:700,letterSpacing:'1px',fontFamily:'inherit'}}
                  onClick={() => navigate('/login', { state: { from: location.pathname + location.search } })}>
                  SIGN IN INSTEAD →
                </button>
              </div>
            ) : (
              <div style={{marginTop:'14px',background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.2)',borderRadius:'8px',padding:'10px 14px'}}>
                <span style={{color:'#4ade80',fontSize:'.75rem',letterSpacing:'1px'}}>✓ Signed in · Fields pre-filled from your profile</span>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div style={S.card}>
            <p style={S.sec}>SELECT RENTAL DATES</p>
            <p style={{color:'#6a7080',fontSize:'.8rem',margin:'-8px 0 16px'}}>
              Click once for start, click again for end.{' '}
              {startDate && !endDate && <span style={{color:'#9b1c31'}}>Now pick end date.</span>}
            </p>
            <Calendar bookedRanges={bookedRanges} startDate={startDate} endDate={endDate} onSelectDate={handleSelectDate}/>
            {startDate && endDate && (
              <div style={{display:'flex',gap:'10px',marginTop:'14px'}}>
                <div style={{flex:1,background:'#13131c',border:'1px solid #1e1e2e',borderRadius:'10px',padding:'10px 14px'}}>
                  <div style={{fontSize:'.65rem',color:'#6a7080',letterSpacing:'1px',fontWeight:600}}>PICKUP</div>
                  <div style={{fontSize:'.85rem',fontWeight:600,color:'#f0f2f8'}}>{startDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                </div>
                <span style={{color:'#9b1c31',alignSelf:'center',fontSize:'1.2rem'}}>→</span>
                <div style={{flex:1,background:'#13131c',border:'1px solid #1e1e2e',borderRadius:'10px',padding:'10px 14px'}}>
                  <div style={{fontSize:'.65rem',color:'#6a7080',letterSpacing:'1px',fontWeight:600}}>RETURN</div>
                  <div style={{fontSize:'.85rem',fontWeight:600,color:'#f0f2f8'}}>{endDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                </div>
              </div>
            )}
          </div>

          {/* Times */}
          <div style={S.card}>
            <p style={S.sec}>PICKUP & DROPOFF TIMES</p>
            <div style={S.row}>
              <div style={S.field}><label style={S.lbl}>Pickup Time</label><input type="time" value={pickupTime} onChange={e=>setPickupTime(e.target.value)} style={S.inp}/></div>
              <div style={S.field}><label style={S.lbl}>Dropoff Time</label><input type="time" value={dropoffTime} onChange={e=>setDropoffTime(e.target.value)} style={S.inp}/></div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div style={S.col}>

          {/* Locations */}
          <div style={S.card}>
            <p style={S.sec}>PICKUP & DROPOFF LOCATIONS</p>
            <div style={S.field}><label style={S.lbl}>Pickup Location</label>
              <select value={pickupLoc} onChange={e=>setPickupLoc(e.target.value)} style={S.inp}>
                {locations.map(l=><option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}
              </select>
            </div>
            <div style={{...S.field,marginTop:'10px'}}><label style={S.lbl}>Dropoff Location</label>
              <select value={dropoffLoc} onChange={e=>setDropoffLoc(e.target.value)} style={S.inp}>
                {locations.map(l=><option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}
              </select>
            </div>
            {isAirport && <p style={{color:'#c8cdd6',fontSize:'.78rem',margin:'10px 0 0'}}>✈️ Airport surcharge of {fmt(AIRPORT_FEE)} will be applied.</p>}
            {isOneWay  && <p style={{color:'#c8cdd6',fontSize:'.78rem',margin:'6px 0 0'}}>🔀 One-way fee of {fmt(ONE_WAY_FEE)} will be applied.</p>}
          </div>

          {/* Driver info */}
          <div style={S.card}>
            <p style={S.sec}>
              {authMode === 'guest' ? 'GUEST INFORMATION' : 'DRIVER INFORMATION'}
            </p>

            {/* Logged-in hint */}
            {authMode === 'logged-in' && (
              <div style={{background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'8px',padding:'9px 14px',marginBottom:'14px'}}>
                <p style={{color:'#4ade80',fontSize:'.72rem',margin:0,letterSpacing:'1px'}}>
                  ✓ Pre-filled from your profile · Edit below if needed
                </p>
              </div>
            )}

            <div style={S.row}>
              <div style={S.field}><label style={S.lbl}>First Name *</label>
                <input placeholder="John" value={driverFirst} onChange={e=>setDriverFirst(e.target.value)} style={S.inp}/>
              </div>
              <div style={S.field}><label style={S.lbl}>Last Name *</label>
                <input placeholder="Doe" value={driverLast} onChange={e=>setDriverLast(e.target.value)} style={S.inp}/>
              </div>
            </div>

            <div style={{...S.field,marginTop:'10px'}}>
              <label style={S.lbl}>Driver's License *</label>
              <input placeholder="D123456789" value={driverLicense} onChange={e=>setDriverLicense(e.target.value)} style={S.inp}/>
            </div>

            <div style={{...S.row,marginTop:'10px'}}>
              <div style={S.field}><label style={S.lbl}>Phone *</label>
                <input placeholder="+1 (555) 000-0000" value={driverPhone} onChange={e=>setDriverPhone(e.target.value)} style={S.inp}/>
              </div>
              <div style={S.field}><label style={S.lbl}>Email {authMode==='guest'?'*':''}</label>
                <input placeholder="john@email.com" value={driverEmail} onChange={e=>setDriverEmail(e.target.value)} style={S.inp}/>
              </div>
            </div>

            {/* Guest-only fields */}
            {authMode === 'guest' && (
              <>
                <div style={{...S.field,marginTop:'10px'}}>
                  <label style={S.lbl}>Home Address *</label>
                  <input placeholder="123 Main St, Syracuse, NY 13201" value={guestAddress} onChange={e=>setGuestAddress(e.target.value)} style={S.inp}/>
                </div>
                <div style={{...S.field,marginTop:'10px'}}>
                  <label style={S.lbl}>Last 4 digits of SSN *</label>
                  <input
                    placeholder="_ _ _ _"
                    maxLength={4}
                    value={guestSSN4}
                    onChange={e=>setGuestSSN4(e.target.value.replace(/\D/g,'').slice(0,4))}
                    style={{...S.inp, letterSpacing:'6px', fontSize:'1.1rem'}}
                  />
                  <span style={{color:'#3a3a50',fontSize:'.62rem',letterSpacing:'1px'}}>Used for identity verification only · Not stored in full</span>
                </div>
              </>
            )}

            <div style={{...S.field,marginTop:'10px'}}>
              <label style={S.lbl}>Notes / Special Requests</label>
              <textarea placeholder="Any special requests..." value={notes} onChange={e=>setNotes(e.target.value)} style={{...S.inp,resize:'vertical',minHeight:'65px'}}/>
            </div>
          </div>

          {/* Insurance */}
          <div style={{...S.card,border:addInsurance?'1px solid #9b1c31':'1px solid #1e1e2e'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <p style={{...S.sec,marginBottom:'4px'}}>INSURANCE COVERAGE</p>
                <p style={{color:'#6a7080',fontSize:'.8rem',margin:0}}>
                  Full coverage · {fmt(INSURANCE_DAILY)}/day
                  {days > 0 && <span style={{color:'#9b1c31'}}> · {fmt(insuranceFee)} total</span>}
                </p>
              </div>
              <div style={{width:'48px',height:'26px',borderRadius:'13px',cursor:'pointer',background:addInsurance?'#9b1c31':'#1e1e2e',position:'relative',transition:'all .3s'}} onClick={()=>setAddInsurance(!addInsurance)}>
                <div style={{position:'absolute',top:'3px',width:'20px',height:'20px',borderRadius:'50%',background:'#fff',transition:'all .3s',left:addInsurance?'25px':'3px'}}/>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div style={S.card}>
            <p style={S.sec}>PAYMENT METHOD</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
              {[
                {value:'credit_card', label:'Credit Card', icon:'💳'},
                {value:'debit_card',  label:'Debit Card',  icon:'🏧'},
                {value:'paypal',      label:'PayPal',       icon:'🅿️'},
                {value:'cash',        label:'Cash',         icon:'💵'},
              ].map(m=>(
                <div key={m.value}
                  style={{border:`1px solid ${paymentMethod===m.value?'#9b1c31':'#1e1e2e'}`,background:paymentMethod===m.value?'rgba(155,28,49,0.15)':'#13131c',borderRadius:'10px',padding:'14px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',transition:'all .2s'}}
                  onClick={()=>setPaymentMethod(m.value)}>
                  <span style={{fontSize:'1.3rem'}}>{m.icon}</span>
                  <span style={{fontSize:'.8rem',fontWeight:600,color:paymentMethod===m.value?'#9b1c31':'#6a7080'}}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{...S.card,border:'1px solid rgba(155,28,49,0.4)'}}>
            <p style={S.sec}>PRICE BREAKDOWN</p>
            <div style={S.sum}><span style={{color:'#6a7080'}}>Daily Rate</span><span>{fmt(parseFloat(car.dailyRate))}</span></div>
            <div style={S.sum}><span style={{color:'#6a7080'}}>Rental Days</span><span>{days>0?`× ${days} day${days!==1?'s':''}`:'—'}</span></div>
            <div style={{...S.sum,fontWeight:600,paddingTop:'8px'}}><span>Subtotal</span><span>{days>0?fmt(subtotal):'—'}</span></div>
            {(isAirport||isOneWay||addInsurance) && (
              <div style={{borderTop:'1px dashed #1e1e2e',margin:'10px 0',paddingTop:'10px'}}>
                <p style={{color:'#6a7080',fontSize:'.68rem',letterSpacing:'1px',margin:'0 0 8px',fontWeight:600}}>FEES</p>
                {isAirport  && <div style={S.sum}><span style={{color:'#6a7080'}}>✈️ Airport Surcharge</span><span>{fmt(airportFee)}</span></div>}
                {isOneWay   && <div style={S.sum}><span style={{color:'#6a7080'}}>🔀 One-Way Fee</span><span>{fmt(oneWayFee)}</span></div>}
                {addInsurance && <div style={S.sum}><span style={{color:'#6a7080'}}>🛡️ Insurance ({days} days)</span><span>{fmt(insuranceFee)}</span></div>}
              </div>
            )}
            <div style={{borderTop:'1px dashed #1e1e2e',margin:'10px 0',paddingTop:'10px'}}>
              <div style={S.sum}><span style={{color:'#6a7080'}}>NY Sales Tax (8.875%)</span><span>{days>0?fmt(taxAmount):'—'}</span></div>
            </div>
            <div style={{borderTop:'1px solid #3a2510',marginTop:'10px',paddingTop:'14px'}}>
              <div style={{...S.sum,fontSize:'1.3rem'}}>
                <span style={{fontWeight:700}}>TOTAL</span>
                <span style={{color:'#9b1c31',fontWeight:800}}>{days>0?`$${grandTotal}`:'—'}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            style={{background:'linear-gradient(135deg,#9b1c31,#7a1526)',border:'none',padding:'18px',borderRadius:'12px',color:'#f0f2f8',fontWeight:800,fontSize:'1rem',cursor:submitting?'wait':'pointer',letterSpacing:'2px',width:'100%',opacity:submitting?.6:1,fontFamily:'inherit',boxShadow:'0 4px 20px rgba(155,28,49,0.4)'}}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'PROCESSING...' : 'CONFIRM BOOKING'}
          </button>

          <p style={{color:'#2a2a3e',fontSize:'.72rem',textAlign:'center',marginTop:'8px',letterSpacing:'1px'}}>
            New York sales tax of 8.875% applies to all rentals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Booking;