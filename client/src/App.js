import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import CarDetails from './pages/CarDetails';
import Booking from './pages/Booking'; // NEW

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    alert("Logout successful.");
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <header style={{ 
          padding: '15px 40px', 
          backgroundColor: '#000', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e46033',
          position: 'sticky',
          top: 0,
          zIndex: 1000 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e46033' }}>RENTAL 10</div>
          <nav>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '30px', margin: 0, padding: 0, alignItems: 'center' }}>
              <li><Link to="/catalog" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>FLEET</Link></li>
              <li><Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>ACCOUNT</Link></li>
              <li>
                <button onClick={handleLogout} style={{ 
                  background: 'transparent', 
                  color: '#d9534f', 
                  border: '1px solid #d9534f', 
                  padding: '5px 15px', 
                  cursor: 'pointer', 
                  borderRadius: '4px',
                  fontSize: '12px' 
                }}>
                  LOGOUT
                </button>
              </li>
            </ul>
          </nav>
        </header>

        <main style={{ minHeight: 'calc(100vh - 70px)', backgroundColor: '#000' }}>
          <Routes>
            <Route path="/catalog"      element={<Catalog />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Login />} />
            <Route path="/details/:id"  element={<CarDetails />} />
            <Route path="/booking/:id"  element={<Booking />} />  {/* NEW */}
            <Route path="/"             element={<Catalog />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
