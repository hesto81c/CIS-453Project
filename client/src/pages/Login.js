import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Sends credentials to the AuthController.js login function
            const response = await api.post('/auth/login', { email, password });
            
            // Save the JWT token to local storage for persistent session
            localStorage.setItem('token', response.data.token);
            
            alert("Login successful!");
            navigate('/catalog'); // Redirects to the Car Catalog after success
        } catch (error) {
            alert(error.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div className="auth-form">
            <h2>Login to Rental10</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;