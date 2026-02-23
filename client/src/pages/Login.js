import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
    const [email,         setEmail]         = useState('');
    const [password,      setPassword]      = useState('');
    const [firstName,     setFirstName]     = useState('');
    const [lastName,      setLastName]      = useState('');
    const [phone,         setPhone]         = useState('');
    const [driverLicense, setDriverLicense] = useState('');
    const [isActive,      setIsActive]      = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo = location.state?.from || '/catalog';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token',         response.data.token);
            localStorage.setItem('userId',        response.data.user.id);
            localStorage.setItem('userFirstName', response.data.user.firstName);
            navigate(redirectTo);
        } catch (error) {
            alert(error.response?.data?.message || "Invalid credentials");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', {
                email, password, firstName,
                lastName:      lastName      || null,
                phone:         phone         || null,
                driverLicense: driverLicense || null,
            });
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
                <div className="auth-bg-curve-1"/>

                {/* ── LOGIN FORM ── */}
                <div className="auth-box-side login-side">
                    <h2>Sign <span>In</span></h2>
                    <p className="auth-subtitle">Access your account</p>

                    {redirectTo !== '/catalog' && (
                        <div className="auth-redirect-notice">
                            Please log in to complete your booking.
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className={`a-input ${email ? 'has-val' : ''}`}>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <label>Email Address</label>
                        </div>
                        <div className={`a-input ${password ? 'has-val' : ''}`}>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <label>Password</label>
                        </div>
                        <button type="submit" className="a-btn">Enter</button>
                    </form>

                    <p className="auth-switch">
                        No account yet?{' '}
                        <span onClick={() => setIsActive(true)}>Create one</span>
                    </p>
                </div>

                {/* ── REGISTER FORM ── */}
                <div className="auth-box-side register-side">
                    <h2>Join <span>Us</span></h2>
                    <p className="auth-subtitle">Create your account</p>

                    <form onSubmit={handleRegister}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                            <div className={`a-input ${firstName ? 'has-val' : ''}`}>
                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                                <label>First Name</label>
                            </div>
                            <div className={`a-input ${lastName ? 'has-val' : ''}`}>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                                <label>Last Name</label>
                            </div>
                        </div>
                        <div className={`a-input ${email ? 'has-val' : ''}`}>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <label>Email Address</label>
                        </div>
                        <div className={`a-input ${password ? 'has-val' : ''}`}>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <label>Password</label>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                            <div className={`a-input ${phone ? 'has-val' : ''}`}>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                                <label>Phone</label>
                            </div>
                            <div className={`a-input ${driverLicense ? 'has-val' : ''}`}>
                                <input type="text" value={driverLicense} onChange={e => setDriverLicense(e.target.value)} />
                                <label>Driver's License</label>
                            </div>
                        </div>
                        <button type="submit" className="a-btn">Create Account</button>
                    </form>

                    <p className="auth-switch">
                        Already a member?{' '}
                        <span onClick={() => setIsActive(false)}>Sign in</span>
                    </p>
                </div>

                {/* ── LOGIN OVERLAY PANEL ── */}
                <div className="auth-overlay-text login-text">
                    <span className="overlay-tag">Rental 10 · Premium Fleet</span>
                    <span className="overlay-number">10</span>
                    <h2>Welcome<br/>Back</h2>
                    <div className="overlay-line"/>
                    <p>Luxury vehicles.<br/>Exceptional service.<br/>Unforgettable journeys.</p>
                    <span className="overlay-vertical">Est. Syracuse · 2026</span>
                </div>

                {/* ── REGISTER OVERLAY PANEL ── */}
                <div className="auth-overlay-text register-text">
                    <span className="overlay-tag">Join the Elite</span>
                    <span className="overlay-number">R</span>
                    <h2>Begin<br/>Your Journey</h2>
                    <div className="overlay-line"/>
                    <p>Exclusive access.<br/>Premium experience.<br/>Your fleet awaits.</p>
                    <span className="overlay-vertical">Rental 10 · Members</span>
                </div>
            </div>
        </div>
    );
};

export default Login;