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
    const [showForgot,    setShowForgot]    = useState(false);
    const [forgotEmail,   setForgotEmail]   = useState('');
    const [forgotStatus,  setForgotStatus]  = useState('idle'); // idle | loading | sent
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

    const handleForgot = async (e) => {
        e.preventDefault();
        setForgotStatus('loading');
        try {
            await api.post('/reset/request', { email: forgotEmail });
            setForgotStatus('sent');
        } catch {
            setForgotStatus('sent'); // same message regardless
        }
    };

    return (
        <div className="exclusive-auth-wrapper">
            <div className={`auth-main-container ${isActive ? 'active' : ''}`}>
                <div className="auth-bg-curve-1"/>

                {/* ── FORGOT PASSWORD OVERLAY ── */}
                {showForgot && (
                    <div style={{
                        position:'absolute', inset:0, background:'rgba(5,5,8,0.96)',
                        zIndex:20, display:'flex', alignItems:'center', justifyContent:'center',
                        animation:'fadeIn .3s ease',
                    }}>
                        <div style={{ width:'100%', maxWidth:'360px', padding:'0 40px', textAlign:'center' }}>
                            {forgotStatus === 'sent' ? (
                                <>
                                    <div style={{ fontSize:'2rem', marginBottom:'16px' }}>✉️</div>
                                    <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:'#f0f2f8', letterSpacing:'3px', fontSize:'1.4rem', marginBottom:'12px' }}>CHECK YOUR EMAIL</h3>
                                    <p style={{ color:'#8a909e', fontSize:'.72rem', letterSpacing:'1px', lineHeight:1.8, marginBottom:'24px' }}>
                                        If that email exists in our system, you'll receive a reset link shortly. Check your spam folder too.
                                    </p>
                                    <button style={btnStyle} onClick={() => { setShowForgot(false); setForgotStatus('idle'); setForgotEmail(''); }}>
                                        BACK TO LOGIN
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ width:'36px', height:'1px', background:'#9b1c31', margin:'0 auto 20px' }}/>
                                    <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:'#f0f2f8', letterSpacing:'4px', fontSize:'1.6rem', marginBottom:'6px' }}>RESET PASSWORD</h3>
                                    <p style={{ color:'#4a5060', fontSize:'.6rem', letterSpacing:'2px', marginBottom:'28px', textTransform:'uppercase' }}>Enter your account email</p>
                                    <form onSubmit={handleForgot}>
                                        <div className={`a-input ${forgotEmail ? 'has-val' : ''}`} style={{ marginBottom:'20px' }}>
                                            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                                            <label>Email Address</label>
                                        </div>
                                        <button type="submit" style={{ ...btnStyle, opacity: forgotStatus === 'loading' ? .6 : 1 }} disabled={forgotStatus === 'loading'}>
                                            {forgotStatus === 'loading' ? 'SENDING...' : 'SEND RESET LINK'}
                                        </button>
                                    </form>
                                    <p style={{ color:'#3a3a50', fontSize:'.65rem', cursor:'pointer', letterSpacing:'1px', marginTop:'20px', textTransform:'uppercase' }}
                                       onClick={() => { setShowForgot(false); setForgotStatus('idle'); }}>
                                        ← Cancel
                                    </p>
                                </>
                            )}
                        </div>
                        <style>{`@keyframes fadeIn { from{opacity:0} to{opacity:1} }`}</style>
                    </div>
                )}

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

                    <p style={{ color:'#8a909e', fontSize:'.65rem', cursor:'pointer', letterSpacing:'1px', marginTop:'12px', textAlign:'center', textTransform:'uppercase', transition:'color .2s' }}
                       onMouseEnter={e => e.target.style.color='#c8cdd6'}
                       onMouseLeave={e => e.target.style.color='#8a909e'}
                       onClick={() => setShowForgot(true)}>
                        Forgot your password?
                    </p>

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

const btnStyle = {
    width:'100%', background:'linear-gradient(135deg,#9b1c31,#7a1526)', border:'none',
    borderRadius:'2px', color:'#f0f2f8', fontWeight:700, fontFamily:"'Montserrat',sans-serif",
    fontSize:'.68rem', letterSpacing:'4px', padding:'13px', cursor:'pointer',
    boxShadow:'0 4px 20px rgba(155,28,49,0.4)', textTransform:'uppercase',
};

export default Login;