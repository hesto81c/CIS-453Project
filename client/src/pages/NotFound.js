import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#050508', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Montserrat', sans-serif", padding: '40px',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Background number */}
      <div style={{
        position: 'absolute', fontSize: '40vw', fontWeight: 900,
        fontFamily: "'Cormorant Garamond', serif",
        color: 'rgba(155,28,49,0.04)', userSelect: 'none',
        lineHeight: 1, top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        letterSpacing: '-10px',
      }}>404</div>

      {/* Accent line top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg,transparent,#9b1c31,#c8cdd6,#9b1c31,transparent)',
      }}/>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '520px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem', fontWeight: 700,
            letterSpacing: '8px', color: '#3a3a50',
          }}>RENTAL <span style={{ color: '#9b1c31' }}>10</span></div>
        </div>

        {/* 404 */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(5rem,15vw,9rem)', fontWeight: 700,
          color: '#f0f2f8', lineHeight: 0.9,
          letterSpacing: '-4px', marginBottom: '8px',
        }}>
          4<span style={{ color: '#9b1c31' }}>0</span>4
        </div>

        {/* Divider */}
        <div style={{
          width: '60px', height: '1px', margin: '24px auto',
          background: 'linear-gradient(90deg,transparent,#9b1c31,transparent)',
        }}/>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.6rem', fontWeight: 400,
          color: '#c8cdd6', margin: '0 0 12px', letterSpacing: '3px',
        }}>PAGE NOT FOUND</h2>

        <p style={{
          color: '#4a5060', fontSize: '13px', lineHeight: 1.8,
          margin: '0 0 48px', letterSpacing: '0.5px',
        }}>
          The page you're looking for doesn't exist or has been moved.<br/>
          Let us take you back to the fleet.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/catalog')}
            style={{
              background: 'linear-gradient(135deg,#9b1c31,#7a1526)',
              border: 'none', borderRadius: '8px',
              padding: '14px 36px', color: '#f0f2f8',
              fontWeight: 700, fontSize: '11px', letterSpacing: '3px',
              cursor: 'pointer', fontFamily: "'Montserrat',sans-serif",
              boxShadow: '0 4px 20px rgba(155,28,49,0.4)',
              transition: 'all .2s',
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            BROWSE FLEET
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: '1px solid #1e1e2e', borderRadius: '8px',
              padding: '14px 36px', color: '#6a7080',
              fontWeight: 600, fontSize: '11px', letterSpacing: '3px',
              cursor: 'pointer', fontFamily: "'Montserrat',sans-serif",
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#9b1c31'; e.target.style.color = '#c8cdd6'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#1e1e2e'; e.target.style.color = '#6a7080'; }}
          >
            GO BACK
          </button>
        </div>

        {/* Bottom decoration */}
        <div style={{ marginTop: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '1px', background: '#1e1e2e' }}/>
          <span style={{ color: '#2a2a3e', fontSize: '10px', letterSpacing: '3px' }}>EST. SYRACUSE · 2026</span>
          <div style={{ width: '30px', height: '1px', background: '#1e1e2e' }}/>
        </div>
      </div>
    </div>
  );
};

export default NotFound;