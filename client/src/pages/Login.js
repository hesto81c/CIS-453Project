import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName]   = useState('');
    const [phone, setPhone]         = useState('');
    const [isActive, setIsActive]   = useState(false);
    const navigate  = useNavigate();
    const location  = useLocation();

    // If redirected from /booking/:id, go back there after login
    const redirectTo = location.state?.from || '/catalog';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token',         response.data.token);
            localStorage.setItem('userId',        response.data.user.id);
            localStorage.setItem('userFirstName', response.data.user.firstName);
            navigate(redirectTo); // returns to booking page if redirected
        } catch (error) {
            alert(error.response?.data?.message || "Invalid credentials");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', {
                email, password, firstName,
                lastName:      lastName || 'Customer',
                phone:         phone    || '000-000-0000',
                driverLicense: 'DL-' + Date.now(),
            });
            // Auto-login after register so user can continue booking
            const loginRes = await api.post('/auth/login', { email, password });
            localStorage.setItem('token',         loginRes.data.token);
            localStorage.setItem('userId',        loginRes.data.user.id);
            localStorage.setItem('userFirstName', loginRes.data.user.firstName);
            navigate(redirectTo);
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="exclusive-auth-wrapper">
            <div className={`auth-main-container ${isActive ? 'active' : ''}`}>
                <div className="auth-bg-curve-1"></div>

                {/* Login Side */}
                <div className="auth-box-side login-side">
                    <h2>Login</h2>
                    {redirectTo !== '/catalog' && (
                        <p style={{ color: '#e46033', fontSize: '.8rem', marginBottom: '8px' }}>
                            Please log in to complete your booking.
                        </p>
                    )}
                    <form onSubmit={handleLogin}>
                        <div className={`a-input ${email ? 'has-val' : ''}`}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>Email</label>
                        </div>
                        <div className={`a-input ${password ? 'has-val' : ''}`}>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <label>Password</label>
                        </div>
                        <button type="submit" className="a-btn">Login</button>
                        <div style={{ marginTop: '16px' }}>
                            <p style={{ color: '#fff', fontSize: '.85rem' }}>
                                Need an account?{' '}
                                <span onClick={() => setIsActive(true)} style={{ color: '#e46033', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</span>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Register Side */}
                <div className="auth-box-side register-side">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleRegister}>
                        <div className={`a-input ${firstName ? 'has-val' : ''}`}>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            <label>First Name</label>
                        </div>
                        <div className={`a-input ${lastName ? 'has-val' : ''}`}>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            <label>Last Name</label>
                        </div>
                        <div className={`a-input ${phone ? 'has-val' : ''}`}>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            <label>Phone</label>
                        </div>
                        <div className={`a-input ${email ? 'has-val' : ''}`}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>Email</label>
                        </div>
                        <div className={`a-input ${password ? 'has-val' : ''}`}>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <label>Password</label>
                        </div>
                        <button type="submit" className="a-btn">Register</button>
                        <div style={{ marginTop: '16px' }}>
                            <p style={{ color: '#fff', fontSize: '.85rem' }}>
                                Have an account?{' '}
                                <span onClick={() => setIsActive(false)} style={{ color: '#e46033', cursor: 'pointer', fontWeight: 'bold' }}>Login</span>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="auth-overlay-text login-text">
                    <h2>RENTAL 10</h2>
                    <p>Luxury Fleet.</p>
                </div>
                <div className="auth-overlay-text register-text">
                    <h2>WELCOME</h2>
                    <p>Join the elite.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;