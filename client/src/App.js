import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Main Navigation Bar */}
        <nav style={{ padding: '10px', backgroundColor: '#f4f4f4', marginBottom: '20px' }}>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '20px' }}>
            <li><Link to="/catalog">Car Catalog</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </nav>

        {/* Route Definitions */}
        <Routes>
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Default path redirects to catalog */}
          <Route path="/" element={<Catalog />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;