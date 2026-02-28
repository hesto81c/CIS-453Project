import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

// ── Card number formatter ──
const formatCardNumber = (val) => val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const formatExpiry     = (val) => { const v = val.replace(/\D/g,'').slice(0,4); return v.length >= 3 ? v.slice(0,2)+'/'+v.slice(2) : v; };
const formatCVV        = (val) => val.replace(/\D/g,'').slice(0,4);

// ── Card brand detector ──
const getCardBrand = (num) => {
  const n = num.replace(/\s/g,'');
  if (/^4/.test(n))           return { brand:'VISA',       color:'#1a1f71' };
  if (/^5[1-5]/.test(n))      return { brand:'MASTERCARD', color:'#eb001b' };
  if (/^3[47]/.test(n))       return { brand:'AMEX',       color:'#2e77bc' };
  if (/^6(?:011|5)/.test(n))  return { brand:'DISCOVER',   color:'#f76f20' };
  return { brand:'', color:'#1e1e2e' };
};

// ── Animated Credit Card Preview ──
const CardPreview = ({ number, name, expiry, isFlipped }) => {
  const { brand, color } = getCardBrand(number);
  const displayNum = number.padEnd(19,' ').replace(/ {1,4}/g, m => m.replace(/ /g,'•')).slice(0,19);

  return (
    <div style={{ perspective:'1000px', width:'100%', maxWidth:'380px', height:'220px', margin:'0 auto 32px' }}>
      <div style={{
        position:'relative', width:'100%', height:'100%',
        transformStyle:'preserve-3d', transition:'transform 0.6s cubic-bezier(.4,0,.2,1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div style={{
          position:'absolute', inset:0, backfaceVisibility:'hidden',
          background:`linear-gradient(135deg, #13131c 0%, ${color}88 100%)`,
          borderRadius:'18px', padding:'28px',
          border:'1px solid #3a3a4a',
          boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ width:'48px', height:'36px', borderRadius:'6px',
              background:'linear-gradient(135deg,#ffd700,#ffaa00)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>💳</div>
            <span style={{ color:'#fff', fontWeight:800, fontSize:'1rem', letterSpacing:'2px', opacity:.9 }}>
              {brand || 'CARD'}
            </span>
          </div>
          <div style={{ fontFamily:'monospace', fontSize:'1.35rem', letterSpacing:'4px', color:'#fff',
            textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>
            {number || '•••• •••• •••• ••••'}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <div>
              <div style={{ color:'rgba(255,255,255,.5)', fontSize:'.6rem', letterSpacing:'2px', marginBottom:'4px' }}>CARD HOLDER</div>
              <div style={{ color:'#fff', fontWeight:600, fontSize:'.9rem', letterSpacing:'1px', textTransform:'uppercase' }}>
                {name || 'FULL NAME'}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ color:'rgba(255,255,255,.5)', fontSize:'.6rem', letterSpacing:'2px', marginBottom:'4px' }}>EXPIRES</div>
              <div style={{ color:'#fff', fontWeight:600, fontSize:'.9rem', letterSpacing:'1px' }}>
                {expiry || 'MM/YY'}
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{
          position:'absolute', inset:0, backfaceVisibility:'hidden',
          transform:'rotateY(180deg)',
          background:'linear-gradient(135deg,#13131c,#2a2a34)',
          borderRadius:'18px', border:'1px solid #3a3a4a',
          boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          overflow:'hidden',
        }}>
          <div style={{ background:'#111', height:'48px', margin:'28px 0 20px', width:'100%' }}/>
          <div style={{ padding:'0 28px' }}>
            <div style={{ color:'rgba(255,255,255,.5)', fontSize:'.6rem', letterSpacing:'2px', marginBottom:'8px' }}>CVV</div>
            <div style={{ background:'#fff', borderRadius:'6px', padding:'10px 16px',
              fontFamily:'monospace', letterSpacing:'6px', color:'#111', fontSize:'1rem' }}>
              {'•••'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Payment Page ──
const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking,    setBooking]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success,    setSuccess]    = useState(null);
  const [error,      setError]      = useState(null);

  // Card fields
  const [cardName,   setCardName]   = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [isFlipped,  setIsFlipped]  = useState(false);

  // PayPal fields
  const [ppEmail,    setPpEmail]    = useState('');
  const [ppPassword, setPpPassword] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/payments/booking/${bookingId}`)
      .then(res => { setBooking(res.data); setLoading(false); })
      .catch(() => { setError("Booking not found."); setLoading(false); });
  }, [bookingId]);

  const handleCardPay = async () => {
    if (!cardName)     return alert("Please enter the cardholder name.");
    if (!cardNumber)   return alert("Please enter a card number.");
    if (!expiry)       return alert("Please enter an expiry date.");
    if (!cvv)          return alert("Please enter a CVV.");

    setProcessing(true);
    try {
      const res = await axios.post(`${API}/api/payments/process/${bookingId}`, {
        cardName,
        last4: cardNumber.replace(/\s/g,'').slice(-4),
        method: booking.method,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaypalPay = async () => {
    if (!ppEmail || !ppPassword) return alert("Please enter your PayPal credentials.");
    setProcessing(true);
    try {
      const res = await axios.post(`${API}/api/payments/process/${bookingId}`, {
        method: 'paypal', cardName: ppEmail, last4: null,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Payment failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCashConfirm = async () => {
    setProcessing(true);
    try {
      const res = await axios.post(`${API}/api/payments/process/${bookingId}`, {
        method: 'cash', cardName: 'Cash Payment', last4: null,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm.");
    } finally {
      setProcessing(false);
    }
  };

  // ── Success Screen ──
  if (success) return (
    <div style={S.wrapper}>
      <div style={S.successBox}>
        <div style={{ fontSize:'5rem', marginBottom:'16px', animation:'pop .4s ease' }}>✅</div>
        <h2 style={{ color:'#c8cdd6', fontFamily:'serif', fontSize:'2.2rem', margin:'0 0 8px' }}>
          Payment Successful!
        </h2>
        <p style={{ color:'#6a7080', marginBottom:'24px' }}>Your booking is now confirmed.</p>
        <div style={S.confirmBox}>
          <div style={S.confirmRow}>
            <span style={{ color:'#6a7080', fontSize:'.75rem', letterSpacing:'1px' }}>CONFIRMATION</span>
            <span style={{ color:'#9b1c31', fontWeight:700, letterSpacing:'2px' }}>{booking?.confirmationNumber}</span>
          </div>
          <div style={S.confirmRow}>
            <span style={{ color:'#6a7080', fontSize:'.75rem', letterSpacing:'1px' }}>TRANSACTION</span>
            <span style={{ color:'#f0f2f8', fontWeight:600, fontSize:'.85rem' }}>{success.transactionId}</span>
          </div>
          <div style={S.confirmRow}>
            <span style={{ color:'#6a7080', fontSize:'.75rem', letterSpacing:'1px' }}>AMOUNT PAID</span>
            <span style={{ color:'#c8cdd6', fontWeight:700, fontSize:'1.1rem' }}>${booking?.amount}</span>
          </div>
        </div>
        <button style={S.btnPrimary} onClick={() => navigate('/catalog')}>BACK TO FLEET</button>
      </div>
    </div>
  );

  if (loading) return <div style={S.centerText}><h2>LOADING...</h2></div>;
  if (error)   return <div style={S.centerText}><h2>{error}</h2></div>;

  const method = booking.method;
  const isCard = method === 'credit_card' || method === 'debit_card';

  return (
    <div style={S.wrapper}>
      <div style={S.container}>

        {/* ── LEFT: Payment Form ── */}
        <div style={S.left}>
          <button onClick={() => navigate(-1)} style={S.backBtn}>← BACK</button>

          <h1 style={S.pageTitle}>
            {isCard      ? (method === 'credit_card' ? 'Credit Card' : 'Debit Card') : ''}
            {method === 'paypal' ? 'PayPal'   : ''}
            {method === 'cash'   ? 'Cash Payment' : ''}
          </h1>
          <p style={S.pageSubtitle}>
            {isCard      ? 'Enter any card details to complete your demo booking.' : ''}
            {method === 'paypal' ? 'Log in with your PayPal account.' : ''}
            {method === 'cash'   ? 'Pay at the rental counter on pickup.' : ''}
          </p>

          {/* ── CARD FORM ── */}
          {isCard && (
            <>
              <CardPreview number={cardNumber} name={cardName} expiry={expiry} isFlipped={isFlipped}/>

              <div style={S.field}>
                <label style={S.lbl}>CARDHOLDER NAME</label>
                <input style={S.input} placeholder="John Doe"
                  value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}/>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>CARD NUMBER</label>
                <input style={S.input} placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div style={S.field}>
                  <label style={S.lbl}>EXPIRY DATE</label>
                  <input style={S.input} placeholder="MM/YY"
                    value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}/>
                </div>
                <div style={S.field}>
                  <label style={S.lbl}>CVV</label>
                  <input style={S.input} placeholder="•••"
                    type="password"
                    value={cvv}
                    onChange={e => setCvv(formatCVV(e.target.value))}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    maxLength={4}/>
                </div>
              </div>

              <button style={{...S.btnPrimary, opacity: processing ? .6 : 1, marginTop:'24px'}}
                onClick={handleCardPay} disabled={processing}>
                {processing ? 'PROCESSING...' : `PAY $${booking.amount}`}
              </button>
            </>
          )}

          {/* ── PAYPAL FORM ── */}
          {method === 'paypal' && (
            <>
              <div style={S.paypalLogo}>
                <span style={{ color:'#003087', fontWeight:900, fontSize:'2rem' }}>Pay</span>
                <span style={{ color:'#009cde', fontWeight:900, fontSize:'2rem' }}>Pal</span>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>PAYPAL EMAIL</label>
                <input style={S.input} type="email" placeholder="email@example.com"
                  value={ppEmail} onChange={e => setPpEmail(e.target.value)}/>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>PASSWORD</label>
                <input style={S.input} type="password" placeholder="••••••••"
                  value={ppPassword} onChange={e => setPpPassword(e.target.value)}/>
              </div>
              <button style={{...S.btnPaypal, opacity: processing ? .6 : 1, marginTop:'24px'}}
                onClick={handlePaypalPay} disabled={processing}>
                {processing ? 'CONNECTING...' : `PAY $${booking.amount} WITH PAYPAL`}
              </button>
              <p style={{ color:'#6a7080', fontSize:'.75rem', textAlign:'center', marginTop:'12px' }}>
                You will be redirected to PayPal to complete payment.
              </p>
            </>
          )}

          {/* ── CASH ── */}
          {method === 'cash' && (
            <>
              <div style={S.cashIcon}>💵</div>
              <div style={S.cashInfo}>
                <div style={S.cashStep}>
                  <span style={S.stepNum}>1</span>
                  <span>Bring your confirmation number to the rental counter.</span>
                </div>
                <div style={S.cashStep}>
                  <span style={S.stepNum}>2</span>
                  <span>Present a valid government-issued ID and driver's license.</span>
                </div>
                <div style={S.cashStep}>
                  <span style={S.stepNum}>3</span>
                  <span>Pay the full amount of <strong style={{ color:'#9b1c31' }}>${booking.amount}</strong> in cash at pickup.</span>
                </div>
                <div style={S.cashStep}>
                  <span style={S.stepNum}>4</span>
                  <span>A deposit may be required. You'll receive a receipt on the spot.</span>
                </div>
              </div>
              <button style={{...S.btnPrimary, opacity: processing ? .6 : 1, marginTop:'24px'}}
                onClick={handleCashConfirm} disabled={processing}>
                {processing ? 'CONFIRMING...' : 'CONFIRM CASH PAYMENT'}
              </button>
            </>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div style={S.right}>
          <div style={S.summaryCard}>
            <p style={S.summaryTitle}>ORDER SUMMARY</p>

            <div style={{ marginBottom:'20px' }}>
              <p style={{ color:'#9b1c31', fontSize:'.75rem', fontWeight:700, letterSpacing:'2px', margin:'0 0 4px' }}>
                VEHICLE
              </p>
              <p style={{ color:'#fff', fontSize:'1.4rem', fontFamily:'serif', margin:'0 0 2px' }}>
                {booking.make} {booking.model}
              </p>
              <p style={{ color:'#6a7080', fontSize:'.85rem', margin:0 }}>{booking.year}</p>
            </div>

            <div style={{ borderTop:'1px solid #1e1e2e', paddingTop:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
              <div style={S.sumRow}>
                <span style={{ color:'#6a7080' }}>Confirmation #</span>
                <span style={{ fontSize:'.85rem', fontWeight:600 }}>{booking.confirmationNumber}</span>
              </div>
              <div style={S.sumRow}>
                <span style={{ color:'#6a7080' }}>Check-in</span>
                <span>{new Date(booking.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
              </div>
              <div style={S.sumRow}>
                <span style={{ color:'#6a7080' }}>Check-out</span>
                <span>{new Date(booking.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
              </div>
              <div style={S.sumRow}>
                <span style={{ color:'#6a7080' }}>Payment Method</span>
                <span style={{ textTransform:'capitalize' }}>{booking.method?.replace('_',' ')}</span>
              </div>
            </div>

            <div style={{ borderTop:'1px solid #3a2510', marginTop:'16px', paddingTop:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700, fontSize:'1.1rem' }}>TOTAL DUE</span>
                <span style={{ color:'#9b1c31', fontWeight:800, fontSize:'1.6rem' }}>
                  ${booking.amount}
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div style={{ marginTop:'24px', display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center' }}>
              {['🔒 SSL Secured', '🛡️ Protected', '✅ Verified'].map(b => (
                <span key={b} style={{ background:'#13131c', border:'1px solid #1e1e2e',
                  borderRadius:'20px', padding:'4px 12px', fontSize:'.7rem', color:'#6a7080' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const S = {
  wrapper:     { background:'#050508', minHeight:'100vh', padding:'40px 30px', fontFamily:"'DM Sans', sans-serif" },
  container:   { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'32px', maxWidth:'1000px', margin:'0 auto', alignItems:'start' },
  left:        { display:'flex', flexDirection:'column', gap:'16px' },
  right:       { position:'sticky', top:'100px' },
  backBtn:     { background:'none', border:'none', color:'#9b1c31', cursor:'pointer', fontWeight:'bold', padding:0, fontSize:'.9rem', textAlign:'left' },
  pageTitle:   { fontFamily:'serif', fontSize:'2.4rem', color:'#fff', margin:'8px 0 4px', lineHeight:1 },
  pageSubtitle:{ color:'#6a7080', fontSize:'.9rem', margin:'0 0 8px' },
  field:       { display:'flex', flexDirection:'column', gap:'6px' },
  lbl:         { fontSize:'.65rem', color:'#6a7080', letterSpacing:'2px', fontWeight:700 },
  input:       { background:'#0d0d14', border:'1px solid #1e1e2e', borderRadius:'10px', color:'#f0f2f8', padding:'14px 16px', fontSize:'1rem', fontFamily:'monospace', outline:'none', colorScheme:'dark', transition:'border-color .2s' },
  btnPrimary:  { background:'linear-gradient(135deg,#9b1c31,#7a1526)', border:'none', padding:'16px', borderRadius:'12px', color:'#000', fontWeight:800, fontSize:'1rem', cursor:'pointer', letterSpacing:'1px', width:'100%', transition:'opacity .2s' },
  btnPaypal:   { background:'#003087', border:'none', padding:'16px', borderRadius:'12px', color:'#fff', fontWeight:800, fontSize:'1rem', cursor:'pointer', letterSpacing:'1px', width:'100%' },
  paypalLogo:  { textAlign:'center', padding:'24px 0 8px', letterSpacing:'1px' },
  cashIcon:    { fontSize:'5rem', textAlign:'center', padding:'16px 0' },
  cashInfo:    { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'14px', padding:'24px', display:'flex', flexDirection:'column', gap:'16px' },
  cashStep:    { display:'flex', gap:'14px', alignItems:'flex-start', color:'#c0c0d0', fontSize:'.9rem', lineHeight:1.5 },
  stepNum:     { background:'linear-gradient(135deg,#9b1c31,#7a1526)', color:'#000', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'.8rem', flexShrink:0 },
  summaryCard: { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'18px', padding:'28px' },
  summaryTitle:{ margin:'0 0 20px', fontSize:'.7rem', fontWeight:700, letterSpacing:'2px', color:'#6a7080', paddingBottom:'12px', borderBottom:'1px solid #1e1e2e' },
  sumRow:      { display:'flex', justifyContent:'space-between', fontSize:'.88rem', color:'#f0f2f8' },
  successBox:  { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'20px', padding:'60px 40px', maxWidth:'520px', margin:'80px auto', textAlign:'center' },
  confirmBox:  { background:'#0d0d14', border:'1px solid #1e1e2e', borderRadius:'12px', padding:'20px 24px', marginBottom:'28px', display:'flex', flexDirection:'column', gap:'12px' },
  confirmRow:  { display:'flex', justifyContent:'space-between', alignItems:'center' },
  centerText:  { textAlign:'center', padding:'100px', color:'#9b1c31' },
};

export default Payment;