import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [isActive, setIsActive] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            alert("Login successful!");
            navigate('/catalog');
        } catch (error) {
            alert(error.response?.data?.message || "Invalid credentials");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { 
                email, password, firstName, 
                lastName: 'Customer',
                driverLicense: 'DL-' + Date.now(),
                phone: '000-000-0000'
            });
            alert("Registration successful!");
            setIsActive(false); 
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="exclusive-auth-wrapper">
            <div className={`auth-main-container ${isActive ? 'active' : ''}`}>
                <div className="auth-bg-curve-1"></div>
                <div className="auth-bg-curve-2"></div>

                <div className="auth-box-side login-side">
                    <h2 className="a-anim" style={{ '--D': 0, '--S': 21 }}>Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className={`a-input a-anim ${email ? 'has-val' : ''}`} style={{ '--D': 1, '--S': 22 }}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>Email</label>
                        </div>
                        <div className={`a-input a-anim ${password ? 'has-val' : ''}`} style={{ '--D': 2, '--S': 23 }}>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <label>Password</label>
                        </div>
                        <button type="submit" className="a-btn a-anim" style={{ '--D': 3, '--S': 24 }}>Login</button>
                        <div className="a-link a-anim" style={{ '--D': 4, '--S': 25 }}>
                            <p>Need an account? <span onClick={() => setIsActive(true)} style={{color: '#e46033', cursor: 'pointer', fontWeight: 'bold'}}>Sign Up</span></p>
                        </div>
                    </form>
                </div>

                <div className="auth-box-side register-side">
                    <h2 className="a-anim" style={{ '--li': 17, '--S': 0 }}>Sign Up</h2>
                    <form onSubmit={handleRegister}>
                        <div className={`a-input a-anim ${firstName ? 'has-val' : ''}`} style={{ '--li': 18, '--S': 1 }}>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            <label>First Name</label>
                        </div>
                        <div className={`a-input a-anim ${email ? 'has-val' : ''}`} style={{ '--li': 19, '--S': 2 }}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>Email</label>
                        </div>
                        <div className={`a-input a-anim ${password ? 'has-val' : ''}`} style={{ '--li': 20, '--S': 3 }}>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <label>Password</label>
                        </div>
                        <button type="submit" className="a-btn a-anim" style={{ '--li': 21, '--S': 4 }}>Register</button>
                        <div className="a-link a-anim" style={{ '--li': 22, '--S': 5 }}>
                            <p>Have an account? <span onClick={() => setIsActive(false)} style={{color: '#e46033', cursor: 'pointer', fontWeight: 'bold'}}>Login</span></p>
                        </div>
                    </form>
                </div>

                <div className="auth-overlay-text login-text">
                    <h2 className="a-anim" style={{ '--D': 0, '--S': 20 }}>RENTAL 10</h2>
                    <p className="a-anim" style={{ '--D': 1, '--S': 21 }}>Luxury Fleet.</p>
                </div>

                <div className="auth-overlay-text register-text">
                    <h2 className="a-anim" style={{ '--li': 17, '--S': 0 }}>WELCOME</h2>
                    <p className="a-anim" style={{ '--li': 18, '--S': 1 }}>Join the elite.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;