import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // API call to login endpoint
            const response = await axios.post(`${API_URL}/api/login`, formData, {
                withCredentials: true
            });
            
            setMessage({
                type: 'success',
                text: 'Login successful! Redirecting to dashboard...'
            });
            
            // Store login state in localStorage if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('userEmail', formData.email);
            }
            
            // Call the success handler with user data
            if (onLoginSuccess) {
                onLoginSuccess(response.data.user);
            }
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
            
            // Navigate to dashboard immediately
            navigate('/chat');
            
        } catch(err) {
            console.log('Login error:', err);
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Login failed. Please check your credentials.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1 className="login-title">Welcome <span className="login-title-highlight">Back</span></h1>
                        <p className="login-subtitle">Sign in to your <strong>account</strong></p>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`login-message ${message.type === 'success' ? 'success' : 'error'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <label htmlFor="email" className="login-label">
                                <strong>Email</strong> Address
                            </label>
                            <div className="login-input-container">
                                <span className="login-input-icon">✉️</span>
                                <input 
                                    id="email" 
                                    name="email"  
                                    type="email" 
                                    autoComplete="email" 
                                    required 
                                    className="login-input"
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        <div className="login-form-group">
                            <div className="login-label-row">
                                <label htmlFor="password" className="login-label">
                                    <strong>Password</strong>
                                </label>
                                <Link to="/forgot-password" className="login-forgot-link">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="login-input-container">
                                <span className="login-input-icon">🔒</span>
                                <input 
                                    id="password" 
                                    name="password" 
                                    type={showPassword ? "text" : "password"} 
                                    autoComplete="current-password" 
                                    required 
                                    className="login-input"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button 
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="login-options">
                            <label className="login-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="login-checkbox"
                                    disabled={isLoading}
                                />
                                <span className="login-checkbox-custom"></span>
                                <span className="login-checkbox-text">Remember me</span>
                            </label>
                        </div>

                        <div className="login-form-group">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="login-loading">
                                        <span className="login-spinner"></span>
                                        Signing In...
                                    </span>
                                ) : (
                                    <strong>Sign In</strong>
                                )}
                            </button>
                        </div>

                        
                    </form>
                    
                    <div className="login-footer">
                        <p className="login-footer-text">
                            Don't have an account? {' '}
                            <Link 
                                to="/signup"
                                className="login-signup-link"
                            >
                                <strong>Create account</strong>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;