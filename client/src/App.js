import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import CarDetails from './pages/CarDetails';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import AdminLogin from './pages/AdminLogin';
import AdminFleet from './pages/AdminFleet';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import './theme.css';

const AppLayout = ({ children }) => {
  const location        = useLocation();
  const isAdmin         = location.pathname.startsWith('/admin');
  const isAdminLoggedIn = !!localStorage.getItem('adminToken');
  const isUserLoggedIn  = !!localStorage.getItem('token');
  const firstName       = localStorage.getItem('userFirstName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userFirstName');
    window.location.href = '/login';
  };

  return (
    <div className="App">
      {!isAdmin && (
        <header style={{
          padding: '0 48px',
          height: '70px',
          background: 'rgba(5,5,8,0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e1e2e',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 0 rgba(155,28,49,0.3)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg,#9b1c31,#5c0f20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 900, color: '#f0f2f8',
              fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px',
              boxShadow: '0 0 16px rgba(155,28,49,0.5)',
            }}>R</div>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.3rem', fontWeight: 700, letterSpacing: '4px',
              color: '#f0f2f8',
            }}>RENTAL <span style={{ color: '#9b1c31' }}>10</span></span>
          </div>

          {/* Nav */}
          <nav>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '8px', alignItems: 'center' }}>
              {[
                { to: '/catalog', label: 'FLEET' },
                { to: isUserLoggedIn ? '/profile' : '/login', label: isUserLoggedIn ? `👤 ${firstName || 'ACCOUNT'}` : 'ACCOUNT' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={{
                    color: '#9098aa', textDecoration: 'none',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '2px',
                    padding: '8px 16px', borderRadius: '4px', transition: 'all .2s',
                    display: 'block',
                  }}
                  onMouseEnter={e => { e.target.style.color = '#f0f2f8'; }}
                  onMouseLeave={e => { e.target.style.color = '#9098aa'; }}
                  >{label}</Link>
                </li>
              ))}

              {isAdminLoggedIn ? (
                <li>
                  <Link to="/admin/fleet" style={{
                    color: '#c8cdd6', textDecoration: 'none', fontSize: '11px',
                    fontWeight: 700, letterSpacing: '2px', padding: '7px 16px',
                    borderRadius: '4px', border: '1px solid #9b1c31',
                    background: 'rgba(155,28,49,0.1)', display: 'flex',
                    alignItems: 'center', gap: '6px', transition: 'all .2s',
                  }}>⚙️ ADMIN</Link>
                </li>
              ) : (
                <li>
                  <Link to="/admin/login" style={{
                    color: '#3a3a50', textDecoration: 'none', fontSize: '13px',
                    padding: '8px',
                  }}>⚙️</Link>
                </li>
              )}

              <li>
                <button onClick={handleLogout} style={{
                  background: 'transparent',
                  color: '#9b1c31',
                  border: '1px solid rgba(155,28,49,0.4)',
                  padding: '7px 18px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  fontFamily: "'Montserrat', sans-serif",
                  transition: 'all .2s',
                }}>LOGOUT</button>
              </li>
            </ul>
          </nav>
        </header>
      )}
      <main style={{ minHeight: isAdmin ? '100vh' : 'calc(100vh - 70px)', background: '#050508' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/catalog"            element={<Catalog />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/register"           element={<Login />} />
          <Route path="/profile"            element={<Profile />} />
          <Route path="/reset-password"     element={<ResetPassword />} />
          <Route path="/details/:id"        element={<CarDetails />} />
          <Route path="/booking/:id"        element={<Booking />} />
          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route path="/admin/login"        element={<AdminLogin />} />
          <Route path="/admin/fleet"        element={<AdminFleet />} />
          <Route path="/"                   element={<Catalog />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;