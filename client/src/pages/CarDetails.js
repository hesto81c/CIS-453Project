import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/cars/${id}`)
      .then(res => {
        setCar(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  // Always go to catalog — details is opened in a new tab from fleet
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate('/catalog');
    } else {
      window.close();
    }
  };

  if (loading) return (
    <div style={styles.centerText}>
      <h2>LOADING VEHICLE...</h2>
    </div>
  );

  if (error || !car) return (
    <div style={styles.centerText}>
      <h2>VEHICLE NOT FOUND</h2>
      <button onClick={handleBack} style={styles.backBtn}>← GO BACK</button>
    </div>
  );

  const isAvailable = car.status === 'available';

  const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const statusColors = {
    available:   { bg: '#1a3a2a', color: '#4ade80', border: '#2a5a3a' },
    reserved:    { bg: '#3a2a10', color: '#fbbf24', border: '#5a4a20' },
    rented:      { bg: '#2a1a3a', color: '#a78bfa', border: '#4a2a5a' },
    maintenance: { bg: '#3a1a1a', color: '#f87171', border: '#5a2a2a' },
    inactive:    { bg: '#1a1a1a', color: '#6b7280', border: '#2a2a2a' },
  };
  const badge = statusColors[car.status] || statusColors.inactive;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        {/* ── Left: Image ── */}
        <div style={styles.imageSection}>
          <img
            src={car.imageUrl || `https://placehold.co/800x600/13131a/7a7a9a?text=${car.make}+${car.model}`}
            alt={`${car.make} ${car.model}`}
            style={styles.mainImage}
            onError={(e) => {
              e.target.src = `https://placehold.co/800x600/13131a/7a7a9a?text=${car.make}+${car.model}`;
            }}
          />
        </div>

        {/* ── Right: Info ── */}
        <div style={styles.infoSection}>
          <button onClick={handleBack} style={styles.backBtn}>← BACK</button>

          {/* Brand + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={styles.brandBadge}>{car.make?.toUpperCase()}</span>
            <span style={{
              padding: '3px 12px', borderRadius: '20px', fontSize: '.7rem',
              fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
            }}>
              {car.status}
            </span>
          </div>

          <h1 style={styles.title}>{car.model}</h1>
          <p style={{ color: '#7a7a9a', marginTop: '-10px', fontSize: '.9rem' }}>
            {car.year} · Plate: {car.plateNumber}
          </p>

          {/* Price */}
          <div style={styles.priceContainer}>
            <span style={styles.priceAmount}>${Number(car.dailyRate).toFixed(2)}</span>
            <span style={styles.priceUnit}> / DAY</span>
          </div>

          {/* Specs Grid */}
          <div style={styles.specsGrid}>
            {[
              { label: 'YEAR',         value: car.year },
              { label: 'CATEGORY',     value: car.category },
              { label: 'TRANSMISSION', value: car.transmission },
              { label: 'FUEL',         value: car.fuelType },
              { label: 'SEATS',        value: `${car.seats} passengers` },
              { label: 'COLOR',        value: car.color || 'N/A' },
              { label: 'MILEAGE',      value: `${Number(car.mileage).toLocaleString()} mi` },
            ].map(s => (
              <div key={s.label} style={styles.specItem}>
                <span style={styles.specLabel}>{s.label}</span>
                <strong style={{ textTransform: 'capitalize', color: '#f0f0f5' }}>{s.value}</strong>
              </div>
            ))}
          </div>

          {/* Location */}
          {car.locationName && (
            <div style={styles.locationBox}>
              <p style={{ margin: 0, fontWeight: 500 }}>
                📍 {car.locationName} — {car.locationCity}
              </p>
              {car.locationAddress && (
                <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#5a5a7a' }}>
                  {car.locationAddress}
                </p>
              )}
            </div>
          )}

          {/* Reviews */}
          {car.reviews?.length > 0 && (
            <div style={styles.reviewsSection}>
              <p style={styles.reviewsTitle}>CUSTOMER REVIEWS</p>
              {car.reviews.map((r, i) => (
                <div key={i} style={styles.reviewItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{r.author}</span>
                    <span style={{ color: '#e46033', letterSpacing: '2px', fontSize: '.8rem' }}>
                      {stars(r.rating)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#7a7a9a', fontSize: '.82rem', lineHeight: 1.5 }}>
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Book Button */}
          <button
            style={{
              ...styles.bookBtn,
              opacity: isAvailable ? 1 : 0.4,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
            }}
            disabled={!isAvailable}
            onClick={() => isAvailable && navigate(`/booking/${car.id}?from=details`)}
          >
            {isAvailable ? 'BOOK NOW' : `UNAVAILABLE · ${car.status?.toUpperCase()}`}
          </button>
        </div>

      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    background: '#000', minHeight: '100vh',
    padding: '40px', display: 'flex', justifyContent: 'center',
  },
  container: {
    display: 'grid', gridTemplateColumns: '1.2fr 1fr',
    maxWidth: '1200px', width: '100%',
    background: '#13131a', borderRadius: '20px',
    border: '1px solid #2a2a3a', overflow: 'hidden',
    alignItems: 'start',
  },
  imageSection: { width: '100%', position: 'sticky', top: '80px' },
  mainImage: { width: '100%', height: '100%', minHeight: '500px', objectFit: 'cover', display: 'block' },
  infoSection: {
    padding: '50px', display: 'flex',
    flexDirection: 'column', gap: '15px',
    overflowY: 'auto', maxHeight: 'calc(100vh - 120px)',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#e46033',
    cursor: 'pointer', textAlign: 'left', fontWeight: 'bold',
    padding: 0, fontSize: '.9rem',
  },
  brandBadge: { color: '#e46033', fontWeight: 'bold', letterSpacing: '2px', fontSize: '.85rem' },
  title: { fontSize: '3.5rem', margin: '4px 0 0', color: '#fff', fontFamily: 'serif', lineHeight: 1 },
  priceContainer: { margin: '10px 0' },
  priceAmount: { fontSize: '3rem', color: '#e46033', fontWeight: 'bold' },
  priceUnit: { color: '#7a7a9a', fontSize: '1rem' },
  specsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  specItem: {
    background: '#1a1a24', padding: '12px', borderRadius: '10px',
    textAlign: 'center', border: '1px solid #2a2a3a',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  specLabel: { color: '#7a7a9a', fontSize: '.65rem', letterSpacing: '1px' },
  locationBox: {
    marginTop: '5px', padding: '14px 16px',
    background: '#1a1a24', borderRadius: '10px',
    border: '1px solid #2a2a3a', color: '#7a7a9a',
  },
  reviewsSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  reviewsTitle: {
    margin: '0 0 4px', fontSize: '.7rem', fontWeight: 600,
    letterSpacing: '2px', color: '#7a7a9a',
    paddingBottom: '8px', borderBottom: '1px solid #2a2a3a',
  },
  reviewItem: {
    background: '#1a1a24', padding: '12px 14px',
    borderRadius: '10px', border: '1px solid #2a2a3a',
  },
  bookBtn: {
    background: '#e46033', border: 'none', padding: '20px',
    borderRadius: '10px', color: '#000', fontWeight: 'bold',
    fontSize: '1.2rem', cursor: 'pointer', marginTop: 'auto',
    letterSpacing: '1px',
  },
  centerText: { textAlign: 'center', padding: '100px', color: '#e46033' },
};

export default CarDetails;