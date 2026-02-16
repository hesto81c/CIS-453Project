import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';

function App() {
  const handleLogout = () => {
    // Clear security token from storage
    localStorage.removeItem('token');
    alert("Logout successful.");
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <header style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
          <nav>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '30px', margin: 0, padding: 0 }}>
              <li><Link to="/catalog" style={{ color: 'white', textDecoration: 'none' }}>Fleet Catalog</Link></li>
              <li><Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link></li>
              <li><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></li>
              <li>
                <button onClick={handleLogout} style={{ background: '#d9534f', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer', borderRadius: '4px' }}>
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </header>

        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Catalog />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;