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
          if (isStart)           { bg='#9b1c31'; color='#000'; radius=isEnd?'8px':'8px 0 0 8px'; }
          if (isEnd && !isStart) { bg='#9b1c31'; color='#000'; radius='0 8px 8px 0'; }
          if (isBooked)          { bg='#1a0a0a'; color='#4a2a2a'; }
          return <div key={i} style={{textAlign:'center',padding:'8px 4px',fontSize:'.85rem',fontWeight:500,userSelect:'none',background:bg,color,borderRadius:radius,cursor}} onClick={() => !disabled && onSelectDate(date)}>{isBooked?<span style={{fontSize:'.6rem',opacity:.5}}>✕</span>:date.getDate()}</div>;
        })}
      </div>
      <div style={{display:'flex',gap:'16px',marginTop:'14px',fontSize:'.72rem',color:'#6a7080',flexWrap:'wrap'}}>
        <span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'3px',marginRight:'5px',background:'linear-gradient(135deg,#9b1c31,#7a1526)'}}/> Selected</span>
        <span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'3px',marginRight:'5px',background:'rgba(155,28,49,0.12)',border:'1px solid #e8c840'}}/> Range</span>
        <span><span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'3px',marginRight:'5px',background:'#1a0a0a'}}/> Unavailable</span>
      </div>
    </div>
  );
};

const Booking = () => {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Read where the user came from: 'catalog' or 'details'
  const searchParams = new URLSearchParams(location.search);
  const cameFrom = searchParams.get('from') || 'catalog';
  const handleBack = () => {
    if (cameFrom === 'details') navigate(`/details/${vehicleId}`);
    else navigate('/catalog');
  };
  const [car, setCar] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pickupLoc, setPickupLoc] = useState('');
  const [dropoffLoc, setDropoffLoc] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [addInsurance, setAddInsurance] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [driverFirst, setDriverFirst] = useState('');
  const [driverLast, setDriverLast] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverEmail, setDriverEmail] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/cars/${vehicleId}`),
      axios.get(`${API}/api/bookings/booked-dates/${vehicleId}`),
      axios.get(`${API}/api/bookings/locations`),
    ]).then(([carRes, datesRes, locsRes]) => {
      setCar(carRes.data);
      setBookedRanges(datesRes.data.map(r => ({ startDate: toDateStr(new Date(r.startDate)), endDate: toDateStr(new Date(r.endDate)) })));
      setLocations(locsRes.data);
      if (locsRes.data.length > 0) { setPickupLoc(locsRes.data[0].id); setDropoffLoc(locsRes.data[0].id); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [vehicleId]);

  const handleSelectDate = useCallback((date) => {
    if (!startDate || (startDate && endDate)) { setStartDate(date); setEndDate(null); }
    else {
      if (date <= startDate) { setStartDate(date); setEndDate(null); }
      else {
        const conflict = bookedRanges.some(r => { const rd = new Date(r.startDate); return rd >= startDate && rd <= date; });
        if (conflict) { alert("Range includes unavailable dates. Please select again."); setStartDate(date); setEndDate(null); }
        else setEndDate(date);
      }
    }
  }, [startDate, endDate, bookedRanges]);

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

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { navigate('/login', { state: { from: location.pathname } }); return; }
    if (!startDate || !endDate) return alert("Please select your rental dates.");
    if (!pickupLoc || !dropoffLoc) return alert("Please select pickup and dropoff locations.");
    if (!driverFirst || !driverLast) return alert("Please enter the driver's name.");
    if (!driverLicense) return alert("Please enter the driver's license number.");
    if (!driverPhone) return alert("Please enter a contact phone number.");
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/bookings`, {
        vehicleId, userId, startDate: toDateStr(startDate), endDate: toDateStr(endDate),
        pickupLocationId: pickupLoc, dropoffLocationId: dropoffLoc, pickupTime, dropoffTime,
        totalAmount: parseFloat(grandTotal), subtotal, airportFee, oneWayFee,
        insuranceFee, taxAmount: parseFloat(taxAmount.toFixed(2)), paymentMethod,
        driverFirst, driverLast, driverLicense, driverPhone, driverEmail, notes,
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/payment/${res.data.bookingId}`);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('userId'); navigate('/login', { state: { from: location.pathname } }); }
      else alert(err.response?.data?.error || "Booking failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (success) return (
    <div style={{background:'#050508',minHeight:'100vh',padding:'40px',display:'flex',justifyContent:'center',alignItems:'center'}}>
      <div style={{background:'#0e0e14',border:'1px solid #1e1e2e',borderRadius:'16px',padding:'60px 40px',maxWidth:'520px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'4rem',marginBottom:'16px'}}>🎉</div>
        <h2 style={{color:'#9b1c31',fontFamily:'serif',fontSize:'2rem',margin:'0 0 8px'}}>Booking Confirmed!</h2>
        <p style={{color:'#6a7080',marginBottom:'28px'}}>Your reservation has been created successfully.</p>
        <div style={{background:'#13131c',border:'1px solid #1e1e2e',borderRadius:'12px',padding:'20px 24px',marginBottom:'28px'}}>
          <p style={{color:'#6a7080',fontSize:'.7rem',letterSpacing:'2px',margin:'0 0 8px'}}>CONFIRMATION NUMBER</p>
          <p style={{color:'#9b1c31',fontSize:'1.5rem',fontWeight:700,letterSpacing:'3px',margin:0}}>{success.confirmationNumber}</p>
        </div>
        <button style={{background:'linear-gradient(135deg,#9b1c31,#7a1526)',border:'none',padding:'18px',borderRadius:'12px',color:'#000',fontWeight:800,fontSize:'1.1rem',cursor:'pointer',width:'100%'}} onClick={() => navigate('/catalog')}>BACK TO FLEET</button>
      </div>
    </div>
  );

  if (loading) return <div style={{textAlign:'center',padding:'100px',color:'#9b1c31'}}><h2>LOADING...</h2></div>;
  if (!car)    return <div style={{textAlign:'center',padding:'100px',color:'#9b1c31'}}><h2>Vehicle not found.</h2></div>;

  const isLoggedIn = !!localStorage.getItem('token');
  const S = {
    wrapper:{background:'#050508',minHeight:'100vh',padding:'40px 30px'},
    layout:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'1100px',margin:'0 auto'},
    col:{display:'flex',flexDirection:'column',gap:'20px'},
    card:{background:'#0e0e14',border:'1px solid #1e1e2e',borderRadius:'16px',padding:'24px'},
    sec:{margin:'0 0 14px',fontSize:'.7rem',fontWeight:700,letterSpacing:'2px',color:'#6a7080',paddingBottom:'10px',borderBottom:'1px solid #1e1e2e'},
    row:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'},
    field:{display:'flex',flexDirection:'column',gap:'6px'},
    lbl:{fontSize:'.7rem',color:'#6a7080',letterSpacing:'1px',fontWeight:600},
    inp:{background:'#050508',border:'1px solid #1e1e2e',borderRadius:'8px',color:'#f0f2f8',padding:'10px 12px',fontSize:'.9rem',fontFamily:'inherit',outline:'none',colorScheme:'dark'},
    sum:{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:'.9rem',color:'#f0f2f8'},
  };

  return (
    <div style={S.wrapper}>
      <div style={S.layout}>
        {/* LEFT */}
        <div style={S.col}>
          <div style={S.card}>
            <button onClick={handleBack} style={{background:'none',border:'none',color:'#9b1c31',cursor:'pointer',fontWeight:'bold',padding:0,fontSize:'.9rem'}}>
              {cameFrom === 'details' ? '← BACK TO DETAILS' : '← BACK TO FLEET'}
            </button>
            <div style={{display:'flex',gap:'16px',alignItems:'center',marginTop:'14px'}}>
              <img src={car.imageUrl||`https://placehold.co/120x80/13131a/7a7a9a?text=${car.make}`} alt={car.model} style={{width:'120px',height:'80px',objectFit:'cover',borderRadius:'8px',flexShrink:0}} onError={e=>{e.target.src=`https://placehold.co/120x80/13131a/7a7a9a?text=${car.make}`;}}/>
              <div>
                <p style={{color:'#9b1c31',fontSize:'.7rem',fontWeight:700,letterSpacing:'2px',margin:'0 0 2px'}}>{car.make?.toUpperCase()}</p>
                <h2 style={{color:'#fff',fontFamily:'serif',fontSize:'1.8rem',margin:'0 0 4px'}}>{car.model}</h2>
                <p style={{color:'#6a7080',fontSize:'.82rem',margin:0}}>{car.year} · {car.transmission} · {car.fuelType}</p>
              </div>
            </div>
          </div>
          <div style={S.card}>
            <p style={S.sec}>SELECT RENTAL DATES</p>
            <p style={{color:'#6a7080',fontSize:'.8rem',margin:'-8px 0 16px'}}>Click once for start, click again for end. {startDate && !endDate && <span style={{color:'#9b1c31'}}>Now pick end date.</span>}</p>
            <Calendar bookedRanges={bookedRanges} startDate={startDate} endDate={endDate} onSelectDate={handleSelectDate}/>
            {startDate && endDate && (
              <div style={{display:'flex',gap:'10px',marginTop:'14px'}}>
                <div style={{flex:1,background:'#13131c',border:'1px solid #1e1e2e',borderRadius:'10px',padding:'10px 14px'}}>
                  <div style={{fontSize:'.65rem',color:'#6a7080',letterSpacing:'1px',fontWeight:600}}>PICKUP</div>
                  <div style={{fontSize:'.85rem',fontWeight:600}}>{startDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                </div>
                <span style={{color:'#9b1c31',alignSelf:'center',fontSize:'1.2rem'}}>→</span>
                <div style={{flex:1,background:'#13131c',border:'1px solid #1e1e2e',borderRadius:'10px',padding:'10px 14px'}}>
                  <div style={{fontSize:'.65rem',color:'#6a7080',letterSpacing:'1px',fontWeight:600}}>RETURN</div>
                  <div style={{fontSize:'.85rem',fontWeight:600}}>{endDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                </div>
              </div>
            )}
          </div>
          <div style={S.card}>
            <p style={S.sec}>PICKUP & DROPOFF TIMES</p>
            <div style={S.row}>
              <div style={S.field}><label style={S.lbl}>Pickup Time</label><input type="time" value={pickupTime} onChange={e=>setPickupTime(e.target.value)} style={S.inp}/></div>
              <div style={S.field}><label style={S.lbl}>Dropoff Time</label><input type="time" value={dropoffTime} onChange={e=>setDropoffTime(e.target.value)} style={S.inp}/></div>
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div style={S.col}>
          <div style={S.card}>
            <p style={S.sec}>PICKUP & DROPOFF LOCATIONS</p>
            <div style={S.field}><label style={S.lbl}>Pickup Location</label>
              <select value={pickupLoc} onChange={e=>setPickupLoc(e.target.value)} style={S.inp}>{locations.map(l=><option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}</select>
            </div>
            <div style={{...S.field,marginTop:'10px'}}><label style={S.lbl}>Dropoff Location</label>
              <select value={dropoffLoc} onChange={e=>setDropoffLoc(e.target.value)} style={S.inp}>{locations.map(l=><option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}</select>
            </div>
            {isAirport && <p style={{color:'#c8cdd6',fontSize:'.78rem',margin:'10px 0 0'}}>✈️ Airport surcharge of {fmt(AIRPORT_FEE)} will be applied.</p>}
            {isOneWay  && <p style={{color:'#c8cdd6',fontSize:'.78rem',margin:'6px 0 0'}}>🔀 One-way fee of {fmt(ONE_WAY_FEE)} will be applied.</p>}
          </div>
          <div style={S.card}>
            <p style={S.sec}>DRIVER INFORMATION</p>
            {!isLoggedIn && (
              <div style={{background:'rgba(155,28,49,0.15)',border:'1px solid #9b1c31',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px'}}>
                <p style={{color:'#9b1c31',fontSize:'.8rem',margin:0}}>⚠️ You'll need to log in before confirming.{' '}
                  <span style={{textDecoration:'underline',cursor:'pointer'}} onClick={()=>navigate('/login',{state:{from:location.pathname}})}>Login now</span>
                </p>
              </div>
            )}
            <div style={S.row}>
              <div style={S.field}><label style={S.lbl}>First Name *</label><input placeholder="John" value={driverFirst} onChange={e=>setDriverFirst(e.target.value)} style={S.inp}/></div>
              <div style={S.field}><label style={S.lbl}>Last Name *</label><input placeholder="Doe" value={driverLast} onChange={e=>setDriverLast(e.target.value)} style={S.inp}/></div>
            </div>
            <div style={{...S.field,marginTop:'10px'}}><label style={S.lbl}>Driver's License *</label><input placeholder="D123456789" value={driverLicense} onChange={e=>setDriverLicense(e.target.value)} style={S.inp}/></div>
            <div style={{...S.row,marginTop:'10px'}}>
              <div style={S.field}><label style={S.lbl}>Phone *</label><input placeholder="+1 (555) 000-0000" value={driverPhone} onChange={e=>setDriverPhone(e.target.value)} style={S.inp}/></div>
              <div style={S.field}><label style={S.lbl}>Email</label><input placeholder="john@email.com" value={driverEmail} onChange={e=>setDriverEmail(e.target.value)} style={S.inp}/></div>
            </div>
            <div style={{...S.field,marginTop:'10px'}}><label style={S.lbl}>Notes / Special Requests</label><textarea placeholder="Any special requests..." value={notes} onChange={e=>setNotes(e.target.value)} style={{...S.inp,resize:'vertical',minHeight:'65px'}}/></div>
          </div>
          <div style={{...S.card,border:addInsurance?'1px solid #9b1c31':'1px solid #1e1e2e'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <p style={{...S.sec,marginBottom:'4px'}}>INSURANCE COVERAGE</p>
                <p style={{color:'#6a7080',fontSize:'.8rem',margin:0}}>Full coverage · {fmt(INSURANCE_DAILY)}/day{days>0&&<span style={{color:'#9b1c31'}}> · {fmt(insuranceFee)} total</span>}</p>
              </div>
              <div style={{width:'48px',height:'26px',borderRadius:'13px',cursor:'pointer',background:addInsurance?'#9b1c31':'#1e1e2e',position:'relative',transition:'all .3s'}} onClick={()=>setAddInsurance(!addInsurance)}>
                <div style={{position:'absolute',top:'3px',width:'20px',height:'20px',borderRadius:'50%',background:'#fff',transition:'all .3s',left:addInsurance?'25px':'3px'}}/>
              </div>
            </div>
          </div>
          <div style={S.card}>
            <p style={S.sec}>PAYMENT METHOD</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
              {[{value:'credit_card',label:'Credit Card',icon:'💳'},{value:'debit_card',label:'Debit Card',icon:'🏧'},{value:'paypal',label:'PayPal',icon:'🅿️'},{value:'cash',label:'Cash',icon:'💵'}].map(m=>(
                <div key={m.value} style={{border:`1px solid ${paymentMethod===m.value?'#9b1c31':'#1e1e2e'}`,background:paymentMethod===m.value?'rgba(155,28,49,0.15)':'#13131c',borderRadius:'10px',padding:'14px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',transition:'all .2s'}} onClick={()=>setPaymentMethod(m.value)}>
                  <span style={{fontSize:'1.3rem'}}>{m.icon}</span>
                  <span style={{fontSize:'.8rem',fontWeight:600,color:paymentMethod===m.value?'#9b1c31':'#6a7080'}}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Price Breakdown */}
          <div style={{...S.card,border:'1px solid rgba(155,28,49,0.4)'}}>
            <p style={S.sec}>PRICE BREAKDOWN</p>
            <div style={S.sum}><span style={{color:'#6a7080'}}>Daily Rate</span><span>{fmt(parseFloat(car.dailyRate))}</span></div>
            <div style={S.sum}><span style={{color:'#6a7080'}}>Rental Days</span><span>{days>0?`× ${days} day${days!==1?'s':''}`:'—'}</span></div>
            <div style={{...S.sum,fontWeight:600,paddingTop:'8px'}}><span>Subtotal</span><span>{days>0?fmt(subtotal):'—'}</span></div>
            {(isAirport||isOneWay||addInsurance)&&(
              <div style={{borderTop:'1px dashed #1e1e2e',margin:'10px 0',paddingTop:'10px'}}>
                <p style={{color:'#6a7080',fontSize:'.68rem',letterSpacing:'1px',margin:'0 0 8px',fontWeight:600}}>FEES</p>
                {isAirport&&<div style={S.sum}><span style={{color:'#6a7080'}}>✈️ Airport Surcharge</span><span>{fmt(airportFee)}</span></div>}
                {isOneWay&&<div style={S.sum}><span style={{color:'#6a7080'}}>🔀 One-Way Fee</span><span>{fmt(oneWayFee)}</span></div>}
                {addInsurance&&<div style={S.sum}><span style={{color:'#6a7080'}}>🛡️ Insurance ({days} days)</span><span>{fmt(insuranceFee)}</span></div>}
              </div>
            )}
            <div style={{borderTop:'1px dashed #1e1e2e',margin:'10px 0',paddingTop:'10px'}}>
              <div style={S.sum}><span style={{color:'#6a7080'}}>NY Sales Tax (8.875%)</span><span>{days>0?fmt(taxAmount):'—'}</span></div>
            </div>
            <div style={{borderTop:'1px solid #3a2510',marginTop:'10px',paddingTop:'14px'}}>
              <div style={{...S.sum,fontSize:'1.3rem'}}><span style={{fontWeight:700}}>TOTAL</span><span style={{color:'#9b1c31',fontWeight:800}}>{days>0?`$${grandTotal}`:'—'}</span></div>
            </div>
          </div>
          <button style={{background:'linear-gradient(135deg,#9b1c31,#7a1526)',border:'none',padding:'18px',borderRadius:'12px',color:'#000',fontWeight:800,fontSize:'1.1rem',cursor:submitting?'wait':'pointer',letterSpacing:'1px',width:'100%',opacity:submitting?.6:1}} onClick={handleSubmit} disabled={submitting}>
            {submitting?'PROCESSING...':isLoggedIn?'CONFIRM BOOKING':'LOGIN TO CONFIRM'}
          </button>
          <p style={{color:'#2a2a3e',fontSize:'.75rem',textAlign:'center',marginTop:'8px'}}>New York sales tax of 8.875% applies to all rentals.</p>
        </div>
      </div>
    </div>
  );
};

export default Booking;