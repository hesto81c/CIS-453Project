import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import '../styles/Catalog.css';

const API = 'http://localhost:5000';

const Catalog = () => {
  const [vehicles,     setVehicles]     = useState([]);
  const [activeIndex,  setActiveIndex]  = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showFilters,  setShowFilters]  = useState(false);

  // ── Filters ──────────────────────────────────────────────
  const [filterCategory,     setFilterCategory]     = useState('');
  const [filterTransmission, setFilterTransmission] = useState('');
  const [filterMaxPrice,     setFilterMaxPrice]     = useState('');
  const [filterDateStart,    setFilterDateStart]    = useState('');
  const [filterDateEnd,      setFilterDateEnd]      = useState('');

  useEffect(() => {
    axios.get(`${API}/api/cars`)
      .then(res => setVehicles(res.data))
      .catch(err => console.error("Error:", err));
  }, []);

  // ── Filtered list ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return vehicles.filter(car => {
      if (filterCategory     && car.category    !== filterCategory)     return false;
      if (filterTransmission && car.transmission !== filterTransmission) return false;
      if (filterMaxPrice     && parseFloat(car.dailyRate) > parseFloat(filterMaxPrice)) return false;
      return true;
    });
  }, [vehicles, filterCategory, filterTransmission, filterMaxPrice]);

  const expandedIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  const categories     = [...new Set(vehicles.map(v => v.category).filter(Boolean))];
  const transmissions  = [...new Set(vehicles.map(v => v.transmission).filter(Boolean))];
  const activeFilters  = [filterCategory, filterTransmission, filterMaxPrice].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCategory('');
    setFilterTransmission('');
    setFilterMaxPrice('');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  return (
    <div className="slider-container">
      <div className="now-showing">Rental10 Showroom</div>

      {/* ── Filter bar ── */}
      <div style={{
        position: 'absolute', top: '16px', right: '24px', zIndex: 50,
        display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        {activeFilters > 0 && (
          <button onClick={clearFilters} style={{
            background: 'rgba(155,28,49,0.2)', border: '1px solid #9b1c31',
            color: '#9b1c31', padding: '7px 14px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '11px', fontWeight: 700,
            letterSpacing: '1px', fontFamily: "'Montserrat',sans-serif",
          }}>
            CLEAR ({activeFilters})
          </button>
        )}
        <button onClick={() => setShowFilters(!showFilters)} style={{
          background: showFilters ? 'rgba(155,28,49,0.3)' : 'rgba(5,5,8,0.8)',
          border: `1px solid ${showFilters ? '#9b1c31' : '#1e1e2e'}`,
          color: showFilters ? '#f0f2f8' : '#9098aa',
          padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
          fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
          fontFamily: "'Montserrat',sans-serif", backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>⚙</span> FILTERS {activeFilters > 0 && `· ${activeFilters}`}
        </button>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div style={{
          position: 'absolute', top: '60px', right: '24px', zIndex: 50,
          background: 'rgba(10,10,16,0.97)', border: '1px solid #1e1e2e',
          borderRadius: '12px', padding: '24px', width: '300px',
          backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          <p style={{ color: '#4a5060', fontSize: '10px', letterSpacing: '3px', fontWeight: 700, margin: '0 0 20px', fontFamily: "'Montserrat',sans-serif" }}>
            FILTER FLEET
          </p>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#6a7080', fontSize: '10px', letterSpacing: '2px', fontWeight: 600, display: 'block', marginBottom: '8px', fontFamily: "'Montserrat',sans-serif" }}>
              CATEGORY
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)} style={{
                  padding: '5px 12px', borderRadius: '4px', cursor: 'pointer',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '1px',
                  fontFamily: "'Montserrat',sans-serif", textTransform: 'capitalize',
                  background: filterCategory === cat ? 'rgba(155,28,49,0.3)' : 'transparent',
                  border: `1px solid ${filterCategory === cat ? '#9b1c31' : '#1e1e2e'}`,
                  color: filterCategory === cat ? '#f0f2f8' : '#6a7080',
                  transition: 'all .2s',
                }}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#6a7080', fontSize: '10px', letterSpacing: '2px', fontWeight: 600, display: 'block', marginBottom: '8px', fontFamily: "'Montserrat',sans-serif" }}>
              TRANSMISSION
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {transmissions.map(t => (
                <button key={t} onClick={() => setFilterTransmission(filterTransmission === t ? '' : t)} style={{
                  padding: '5px 12px', borderRadius: '4px', cursor: 'pointer',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '1px',
                  fontFamily: "'Montserrat',sans-serif", textTransform: 'capitalize',
                  background: filterTransmission === t ? 'rgba(155,28,49,0.3)' : 'transparent',
                  border: `1px solid ${filterTransmission === t ? '#9b1c31' : '#1e1e2e'}`,
                  color: filterTransmission === t ? '#f0f2f8' : '#6a7080',
                  transition: 'all .2s',
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Max price */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#6a7080', fontSize: '10px', letterSpacing: '2px', fontWeight: 600, display: 'block', marginBottom: '8px', fontFamily: "'Montserrat',sans-serif" }}>
              MAX DAILY RATE
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range" min="50" max="500" step="25"
                value={filterMaxPrice || 500}
                onChange={e => setFilterMaxPrice(e.target.value === '500' ? '' : e.target.value)}
                style={{ flex: 1, accentColor: '#9b1c31' }}
              />
              <span style={{ color: '#f0f2f8', fontSize: '13px', fontWeight: 700, minWidth: '50px', fontFamily: "'Montserrat',sans-serif" }}>
                {filterMaxPrice ? `$${filterMaxPrice}` : 'Any'}
              </span>
            </div>
          </div>

          {/* Date range */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: '#6a7080', fontSize: '10px', letterSpacing: '2px', fontWeight: 600, display: 'block', marginBottom: '8px', fontFamily: "'Montserrat',sans-serif" }}>
              AVAILABILITY DATES
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ color: '#4a5060', fontSize: '9px', letterSpacing: '1px', marginBottom: '4px', fontFamily: "'Montserrat',sans-serif" }}>FROM</div>
                <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)}
                  style={{ width: '100%', background: '#050508', border: '1px solid #1e1e2e', borderRadius: '6px', color: '#f0f2f8', padding: '7px 8px', fontSize: '11px', colorScheme: 'dark', fontFamily: "'Montserrat',sans-serif" }}
                />
              </div>
              <div>
                <div style={{ color: '#4a5060', fontSize: '9px', letterSpacing: '1px', marginBottom: '4px', fontFamily: "'Montserrat',sans-serif" }}>TO</div>
                <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)}
                  style={{ width: '100%', background: '#050508', border: '1px solid #1e1e2e', borderRadius: '6px', color: '#f0f2f8', padding: '7px 8px', fontSize: '11px', colorScheme: 'dark', fontFamily: "'Montserrat',sans-serif" }}
                />
              </div>
            </div>
            {filterDateStart && filterDateEnd && (
              <p style={{ color: '#4a5060', fontSize: '10px', margin: '8px 0 0', fontFamily: "'Montserrat',sans-serif" }}>
                * Date filtering shown at booking — all listed cars may have partial availability
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          textAlign: 'center', zIndex: 10,
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚗</div>
          <p style={{ color: '#f0f2f8', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', margin: '0 0 8px' }}>No vehicles match</p>
          <p style={{ color: '#6a7080', fontSize: '13px', margin: '0 0 20px' }}>Try adjusting your filters</p>
          <button onClick={clearFilters} style={{
            background: 'linear-gradient(135deg,#9b1c31,#7a1526)', border: 'none',
            color: '#f0f2f8', padding: '12px 28px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 700, fontSize: '11px', letterSpacing: '2px',
            fontFamily: "'Montserrat',sans-serif",
          }}>CLEAR FILTERS</button>
        </div>
      )}

      {/* ── Accordion ── */}
      <div className="accordion-slider">
        {filtered.map((car, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={car.id || car._id}
              className={`slide ${isExpanded ? 'active' : ''}`}
              style={{
                backgroundImage:    `url("${car.imageUrl}")`,
                backgroundColor:    '#0e0e14',
                backgroundSize:     'cover',
                backgroundPosition: 'center',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(index)}
            >
              {/* Collapsed label */}
              <div className="slide-label-collapsed">
                <span className="label-number">0{index + 1}</span>
                <span className="label-name">{car.make} {car.model}</span>
              </div>

              {/* Expanded content */}
              <div className="slide-content">
                <div className="slide-number">0{index + 1}</div>
                <div className="car-brand">{car.make || car.brand}</div>
                <div className="car-name">{car.model}</div>

                <div className="car-specs">
                  <div className="spec-row">
                    <span className="spec-label">Daily Rate</span>
                    <span className="spec-value">${car.dailyRate || car.pricePerDay} USD</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Year</span>
                    <span className="spec-value">{car.year}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Category</span>
                    <span className="spec-value" style={{ textTransform: 'capitalize' }}>{car.category}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value" style={{ textTransform: 'capitalize' }}>{car.transmission}</span>
                  </div>
                </div>

                <div className="slide-buttons">
                  <button className="details-btn" onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/details/${car.id || car._id}`, '_blank');
                  }}>DETAILS</button>
                  <button className="rent-btn" onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/booking/${car.id || car._id}?from=catalog`;
                  }}>RENT NOW</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Catalog;