import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';

function App() {
  
  // Logic to handle Logout (FR1)
  const handleLogout = () => {
    // 1. Remove the security token from browser storage
    localStorage.removeItem('token');
    
    // 2. Alert the user and redirect to the login page
    alert("You have been logged out successfully.");
    window.location.href = '/login'; 
  };

  return (
    <Router>
      <div className="App">
        {/* Main Navigation Header */}
        <header style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
          <nav>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '30px', margin: 0, padding: 0 }}>
              <li>
                <Link to="/catalog" style={{ color: 'white', textDecoration: 'none' }}>Fleet Catalog</Link>
              </li>
              <li>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
              </li>
              <li>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
              </li>
              <li>
                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    background: 'red', 
                    color: 'white', 
                    border: 'none', 
                    padding: '5px 10px', 
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </header>

        {/* Page Content Area */}
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Default Landing Page */}
            <Route path="/" element={<Catalog />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;