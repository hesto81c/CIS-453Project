import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── Helpers ────────────────────────────────────────────────────
const API = 'http://localhost:5000';

const toDateStr = (date) => date.toISOString().split('T')[0];

const getDaysBetween = (start, end) => {
  if (!start || !end) return 0;
  const diff = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const isDateInRanges = (date, ranges) => {
  const d = toDateStr(date);
  return ranges.some(r => d >= r.startDate && d <= r.endDate);
};

const isSameDay = (a, b) => toDateStr(a) === toDateStr(b);
const isInRange = (date, start, end) => {
  if (!start || !end) return false;
  return date > start && date < end;
};

// ─── Calendar Component ──────────────────────────────────────────
const Calendar = ({ bookedRanges, startDate, endDate, onSelectDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div style={calStyles.wrap}>
      {/* Header */}
      <div style={calStyles.header}>
        <button style={calStyles.navBtn} onClick={prevMonth}>‹</button>
        <span style={calStyles.monthLabel}>{monthName}</span>
        <button style={calStyles.navBtn} onClick={nextMonth}>›</button>
      </div>

      {/* Day names */}
      <div style={calStyles.grid}>
        {days.map(d => (
          <div key={d} style={calStyles.dayName}>{d}</div>
        ))}

        {/* Cells */}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;

          const isPast    = date < today;
          const isBooked  = isDateInRanges(date, bookedRanges);
          const isStart   = startDate && isSameDay(date, startDate);
          const isEnd     = endDate   && isSameDay(date, endDate);
          const inRange   = isInRange(date, startDate, endDate);
          const disabled  = isPast || isBooked;

          let bg = 'transparent', color = '#f0f0f5', radius = '8px', cursor = 'pointer';
          if (disabled)  { color = '#3a3a4a'; cursor = 'not-allowed'; }
          if (inRange)   { bg = '#2a1f0a'; color = '#e8c840'; radius = '0'; }
          if (isStart)   { bg = '#e46033'; color = '#000'; radius = '8px 0 0 8px'; }
          if (isEnd)     { bg = '#e46033'; color = '#000'; radius = '0 8px 8px 0'; }
          if (isStart && isEnd) radius = '8px';
          if (isBooked)  { bg = '#2a1a1a'; color = '#5a3a3a'; }

          return (
            <div
              key={i}
              style={{ ...calStyles.cell, background: bg, color, borderRadius: radius, cursor }}
              onClick={() => !disabled && onSelectDate(date)}
              title={isBooked ? 'Already booked' : ''}
            >
              {isBooked
                ? <span style={{ fontSize: '.65rem', opacity: .5 }}>✕</span>
                : date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={calStyles.legend}>
        <span><span style={{ ...calStyles.dot, background: '#e46033' }} /> Selected</span>
        <span><span style={{ ...calStyles.dot, background: '#2a1f0a', border: '1px solid #e8c840' }} /> Your range</span>
        <span><span style={{ ...calStyles.dot, background: '#2a1a1a' }} /> Unavailable</span>
      </div>
    </div>
  );
};

const calStyles = {
  wrap:        { background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '14px', padding: '20px' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  monthLabel:  { fontWeight: 700, fontSize: '1rem', color: '#f0f0f5', letterSpacing: '1px' },
  navBtn:      { background: 'none', border: '1px solid #2a2a3a', color: '#e46033', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  dayName:     { textAlign: 'center', fontSize: '.7rem', color: '#7a7a9a', padding: '6px 0', fontWeight: 600, letterSpacing: '1px' },
  cell:        { textAlign: 'center', padding: '8px 4px', fontSize: '.85rem', fontWeight: 500, transition: 'all .15s', userSelect: 'none' },
  legend:      { display: 'flex', gap: '16px', marginTop: '14px', fontSize: '.72rem', color: '#7a7a9a', flexWrap: 'wrap' },
  dot:         { display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', marginRight: '5px', verticalAlign: 'middle' },
};

// ─── Main Booking Page ───────────────────────────────────────────
const Booking = () => {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();

  const [car,           setCar]           = useState(null);
  const [bookedRanges,  setBookedRanges]  = useState([]);
  const [locations,     setLocations]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [success,       setSuccess]       = useState(null);
  const [error,         setError]         = useState(null);

  // Booking state
  const [startDate,     setStartDate]     = useState(null);
  const [endDate,       setEndDate]       = useState(null);
  const [pickupLoc,     setPickupLoc]     = useState('');
  const [dropoffLoc,    setDropoffLoc]    = useState('');
  const [pickupTime,    setPickupTime]    = useState('10:00');
  const [dropoffTime,   setDropoffTime]   = useState('10:00');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes,         setNotes]         = useState('');

  // Driver form
  const [driverFirst,   setDriverFirst]   = useState('');
  const [driverLast,    setDriverLast]    = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverPhone,   setDriverPhone]   = useState('');
  const [driverEmail,   setDriverEmail]   = useState('');

  // Fetch car + booked dates + locations
  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/cars/${vehicleId}`),
      axios.get(`${API}/api/bookings/booked-dates/${vehicleId}`),
      axios.get(`${API}/api/bookings/locations`),
    ])
    .then(([carRes, datesRes, locsRes]) => {
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
    })
    .catch(() => { setError("Failed to load booking page."); setLoading(false); });
  }, [vehicleId]);

  // Calendar date selection logic
  const handleSelectDate = useCallback((date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date <= startDate) {
        setStartDate(date);
        setEndDate(null);
      } else {
        // Check no booked dates fall in range
        const rangeHasConflict = bookedRanges.some(r => {
          const rd = new Date(r.startDate);
          return rd >= startDate && rd <= date;
        });
        if (rangeHasConflict) {
          alert("Your selected range includes unavailable dates. Please choose again.");
          setStartDate(date);
          setEndDate(null);
        } else {
          setEndDate(date);
        }
      }
    }
  }, [startDate, endDate, bookedRanges]);

  const days        = getDaysBetween(startDate, endDate);
  const totalAmount = car ? (days * parseFloat(car.dailyRate)).toFixed(2) : '0.00';

  const handleSubmit = async () => {
    if (!startDate || !endDate)      return alert("Please select your rental dates.");
    if (!pickupLoc || !dropoffLoc)   return alert("Please select pickup and dropoff locations.");
    if (!driverFirst || !driverLast) return alert("Please enter the driver's name.");
    if (!driverLicense)              return alert("Please enter the driver's license number.");
    if (!driverPhone)                return alert("Please enter a contact phone number.");

    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/bookings`, {
        vehicleId,
        userId:             localStorage.getItem('userId') || 'guest',
        startDate:          toDateStr(startDate),
        endDate:            toDateStr(endDate),
        pickupLocationId:   pickupLoc,
        dropoffLocationId:  dropoffLoc,
        pickupTime,
        dropoffTime,
        totalAmount:        parseFloat(totalAmount),
        paymentMethod,
        driverName:         `${driverFirst} ${driverLast}`,
        driverLicense,
        driverPhone,
        notes,
      });
      setSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ──
  if (success) return (
    <div style={S.wrapper}>
      <div style={{ ...S.card, maxWidth: '500px', textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ color: '#e46033', fontFamily: 'serif', fontSize: '2rem', marginBottom: '10px' }}>
          Booking Confirmed!
        </h2>
        <p style={{ color: '#7a7a9a', marginBottom: '24px' }}>Your reservation has been created successfully.</p>
        <div style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <p style={{ color: '#7a7a9a', fontSize: '.8rem', letterSpacing: '1px', marginBottom: '8px' }}>CONFIRMATION NUMBER</p>
          <p style={{ color: '#e46033', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px' }}>
            {success.confirmationNumber}
          </p>
        </div>
        <button style={S.btnPrimary} onClick={() => navigate('/catalog')}>
          BACK TO FLEET
        </button>
      </div>
    </div>
  );

  if (loading) return <div style={S.centerText}><h2>LOADING...</h2></div>;
  if (error)   return <div style={S.centerText}><h2>{error}</h2></div>;

  return (
    <div style={S.wrapper}>
      <div style={S.pageLayout}>

        {/* ── LEFT COLUMN ── */}
        <div style={S.leftCol}>

          {/* Car Summary */}
          <div style={S.card}>
            <button onClick={() => navigate(-1)} style={S.backBtn}>← BACK</button>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
              <img
                src={car.imageUrl || `https://placehold.co/120x80/13131a/7a7a9a?text=${car.make}`}
                alt={car.model}
                style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                onError={(e) => { e.target.src = `https://placehold.co/120x80/13131a/7a7a9a?text=${car.make}`; }}
              />
              <div>
                <p style={{ color: '#e46033', fontSize: '.75rem', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>
                  {car.make?.toUpperCase()}
                </p>
                <h2 style={{ color: '#fff', fontFamily: 'serif', fontSize: '1.8rem', margin: '2px 0' }}>
                  {car.model}
                </h2>
                <p style={{ color: '#7a7a9a', fontSize: '.85rem', margin: 0 }}>
                  {car.year} · {car.transmission} · {car.fuelType}
                </p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div style={S.card}>
            <p style={S.sectionTitle}>SELECT RENTAL DATES</p>
            <p style={{ color: '#7a7a9a', fontSize: '.8rem', marginBottom: '16px', marginTop: '-8px' }}>
              Click once for start date, click again for end date.
              {startDate && !endDate && <span style={{ color: '#e46033' }}> Now select end date.</span>}
            </p>
            <Calendar
              bookedRanges={bookedRanges}
              startDate={startDate}
              endDate={endDate}
              onSelectDate={handleSelectDate}
            />
            {startDate && endDate && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <div style={S.dateChip}>
                  <span style={S.chipLabel}>PICKUP</span>
                  <span style={S.chipValue}>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div style={{ color: '#e46033', alignSelf: 'center', fontSize: '1.2rem' }}>→</div>
                <div style={S.dateChip}>
                  <span style={S.chipLabel}>RETURN</span>
                  <span style={S.chipValue}>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pickup/Dropoff Times */}
          <div style={S.card}>
            <p style={S.sectionTitle}>PICKUP & DROPOFF TIMES</p>
            <div style={S.row}>
              <div style={S.field}>
                <label style={S.label}>Pickup Time</label>
                <input type="time" value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)} style={S.input} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Dropoff Time</label>
                <input type="time" value={dropoffTime}
                  onChange={e => setDropoffTime(e.target.value)} style={S.input} />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={S.rightCol}>

          {/* Location Selector */}
          <div style={S.card}>
            <p style={S.sectionTitle}>PICKUP & DROPOFF LOCATIONS</p>
            <div style={S.field}>
              <label style={S.label}>Pickup Location</label>
              <select value={pickupLoc} onChange={e => setPickupLoc(e.target.value)} style={S.input}>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name} — {l.city}</option>
                ))}
              </select>
            </div>
            <div style={{ ...S.field, marginTop: '10px' }}>
              <label style={S.label}>Dropoff Location</label>
              <select value={dropoffLoc} onChange={e => setDropoffLoc(e.target.value)} style={S.input}>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name} — {l.city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Driver Information */}
          <div style={S.card}>
            <p style={S.sectionTitle}>DRIVER INFORMATION</p>
            <div style={S.row}>
              <div style={S.field}>
                <label style={S.label}>First Name *</label>
                <input placeholder="John" value={driverFirst}
                  onChange={e => setDriverFirst(e.target.value)} style={S.input} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Last Name *</label>
                <input placeholder="Doe" value={driverLast}
                  onChange={e => setDriverLast(e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={{ ...S.field, marginTop: '10px' }}>
              <label style={S.label}>Driver's License Number *</label>
              <input placeholder="e.g. D123456789" value={driverLicense}
                onChange={e => setDriverLicense(e.target.value)} style={S.input} />
            </div>
            <div style={S.row}>
              <div style={{ ...S.field, marginTop: '10px' }}>
                <label style={S.label}>Phone *</label>
                <input placeholder="+1 (555) 000-0000" value={driverPhone}
                  onChange={e => setDriverPhone(e.target.value)} style={S.input} />
              </div>
              <div style={{ ...S.field, marginTop: '10px' }}>
                <label style={S.label}>Email</label>
                <input placeholder="john@email.com" value={driverEmail}
                  onChange={e => setDriverEmail(e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={{ ...S.field, marginTop: '10px' }}>
              <label style={S.label}>Special Requests / Notes</label>
              <textarea placeholder="Any special requests..." value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ ...S.input, resize: 'vertical', minHeight: '70px' }} />
            </div>
          </div>

          {/* Payment Method */}
          <div style={S.card}>
            <p style={S.sectionTitle}>PAYMENT METHOD</p>
            <div style={S.paymentGrid}>
              {[
                { value: 'credit_card',  label: 'Credit Card',  icon: '💳' },
                { value: 'debit_card',   label: 'Debit Card',   icon: '🏧' },
                { value: 'paypal',       label: 'PayPal',       icon: '🅿️' },
                { value: 'cash',         label: 'Cash',         icon: '💵' },
              ].map(m => (
                <div
                  key={m.value}
                  style={{
                    ...S.paymentOption,
                    borderColor: paymentMethod === m.value ? '#e46033' : '#2a2a3a',
                    background:  paymentMethod === m.value ? '#2a1510' : '#1a1a24',
                  }}
                  onClick={() => setPaymentMethod(m.value)}
                >
                  <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                  <span style={{ fontSize: '.8rem', fontWeight: 600, color: paymentMethod === m.value ? '#e46033' : '#7a7a9a' }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div style={{ ...S.card, border: '1px solid #3a2510' }}>
            <p style={S.sectionTitle}>PRICE SUMMARY</p>
            <div style={S.summaryRow}>
              <span style={{ color: '#7a7a9a' }}>Daily Rate</span>
              <span>${parseFloat(car.dailyRate).toFixed(2)}</span>
            </div>
            <div style={S.summaryRow}>
              <span style={{ color: '#7a7a9a' }}>Rental Days</span>
              <span>{startDate && endDate ? `${days} day${days !== 1 ? 's' : ''}` : '—'}</span>
            </div>
            <div style={{ borderTop: '1px solid #2a2a3a', marginTop: '12px', paddingTop: '12px' }}>
              <div style={{ ...S.summaryRow, fontSize: '1.3rem' }}>
                <span style={{ fontWeight: 700 }}>TOTAL</span>
                <span style={{ color: '#e46033', fontWeight: 700 }}>
                  {startDate && endDate ? `$${totalAmount}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            style={{
              ...S.btnPrimary,
              opacity: submitting ? .6 : 1,
              cursor: submitting ? 'wait' : 'pointer',
            }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'PROCESSING...' : 'CONFIRM BOOKING'}
          </button>

          <p style={{ color: '#3a3a5a', fontSize: '.75rem', textAlign: 'center' }}>
            By confirming, you agree to our rental terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Styles ─────────────────────────────────────────────────────
const S = {
  wrapper:     { background: '#000', minHeight: '100vh', padding: '40px 30px' },
  pageLayout:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1100px', margin: '0 auto' },
  leftCol:     { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol:    { display: 'flex', flexDirection: 'column', gap: '20px' },
  card:        { background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '24px' },
  sectionTitle:{ margin: '0 0 14px', fontSize: '.7rem', fontWeight: 700, letterSpacing: '2px', color: '#7a7a9a', paddingBottom: '10px', borderBottom: '1px solid #2a2a3a' },
  backBtn:     { background: 'none', border: 'none', color: '#e46033', cursor: 'pointer', fontWeight: 'bold', padding: 0, fontSize: '.9rem' },
  row:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { fontSize: '.7rem', color: '#7a7a9a', letterSpacing: '1px', fontWeight: 600 },
  input:       {
    background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '8px',
    color: '#f0f0f5', padding: '10px 12px', fontSize: '.9rem',
    fontFamily: 'inherit', outline: 'none',
    colorScheme: 'dark',
  },
  dateChip:    { flex: 1, background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '3px' },
  chipLabel:   { fontSize: '.65rem', color: '#7a7a9a', letterSpacing: '1px', fontWeight: 600 },
  chipValue:   { fontSize: '.85rem', fontWeight: 600, color: '#f0f0f5' },
  paymentGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  paymentOption: { border: '1px solid', borderRadius: '10px', padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all .2s' },
  summaryRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '.95rem', color: '#f0f0f5' },
  btnPrimary:  { background: '#e46033', border: 'none', padding: '18px', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', letterSpacing: '1px', width: '100%' },
  centerText:  { textAlign: 'center', padding: '100px', color: '#e46033' },
};

export default Booking;
