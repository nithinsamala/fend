import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
const API_URL = import.meta.env.VITE_API_URL;
const Signup = ({ onSignupSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Signup.js - Add this useEffect
useEffect(() => {
  const checkIfLoggedIn = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check`, {
        withCredentials: true
      });
      if (response.data.isAuthenticated) {
        navigate('/chat');
      }
    } catch (error) {
      console.log('Auth check error:', error);
    }
  };
  
  checkIfLoggedIn();
}, [navigate]);

    useEffect(() => {
        const calculateStrength = (pwd) => {
            let strength = 0;
            if (pwd.length > 0) strength += 1;
            if (pwd.length >= 6) strength += 1;
            if (/[A-Z]/.test(pwd)) strength += 1;
            if (/[0-9]/.test(pwd)) strength += 1;
            if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
            return Math.min(strength, 5);
        };

        setPasswordStrength(calculateStrength(formData.password));
    }, [formData.password]);

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
            const response = await axios.post(
                `${API_URL}/api/signup`,
                formData,
                { withCredentials: true }
            );

            setMessage({
                type: 'success',
                text: 'Account created successfully! Redirecting to dashboard...'
            });

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: ''
            });

            if (onSignupSuccess) {
                onSignupSuccess(response.data.user);
            }

            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);

            navigate('/chat');

        } catch (err) {
            console.log('Signup error:', err);
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Signup failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength === 0) return 'gray';
        if (passwordStrength === 1) return '#ef4444';
        if (passwordStrength === 2) return '#f97316';
        if (passwordStrength === 3) return '#eab308';
        return '#22c55e';
    };

    const getStrengthText = () => {
        const texts = ['', 'Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
        return texts[passwordStrength] || '';
    };

    return (
        <div className="signup-page-container">
            <div className="signup-container">
                <div className="signup-card">
                    <div className="signup-header">
                        <h1 className="signup-title">
                            Create Your <span className="signup-title-highlight">Account</span>
                        </h1>
                        <p className="signup-subtitle">
                            Join us today to get <strong>started</strong>
                        </p>
                    </div>

                    {message.text && (
                        <div className={`signup-message ${message.type === 'success' ? 'success' : 'error'}`}>
                            {message.text}
                        </div>
                    )}

                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="signup-form-row">
                            <div className="signup-form-group">
                                <label htmlFor="first-name" className="signup-label">
                                    <strong>First</strong> Name
                                </label>
                                <div className="signup-input-container">
                                    <span className="signup-input-icon">👤</span>
                                    <input
                                        id="first-name"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        required
                                        className="signup-input"
                                        placeholder="John"
                                        disabled={isLoading}
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="signup-form-group">
                                <label htmlFor="last-name" className="signup-label">
                                    <strong>Last</strong> Name
                                </label>
                                <div className="signup-input-container">
                                    <span className="signup-input-icon">👤</span>
                                    <input
                                        id="last-name"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        required
                                        className="signup-input"
                                        placeholder="Doe"
                                        disabled={isLoading}
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="signup-form-group">
                            <label htmlFor="email" className="signup-label">
                                <strong>Email</strong> Address
                            </label>
                            <div className="signup-input-container">
                                <span className="signup-input-icon">✉️</span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="signup-input"
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="signup-form-group">
                            <label htmlFor="password" className="signup-label">
                                <strong>Password</strong>
                            </label>
                            <div className="signup-input-container">
                                <span className="signup-input-icon">🔒</span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="signup-input"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="signup-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>

                            <div className="password-strength-container">
                                <div className="password-strength-header">
                                    <span className="password-strength-label">Password Strength</span>
                                    <span
                                        className="password-strength-text"
                                        style={{ color: getStrengthColor() }}
                                    >
                                        {getStrengthText()}
                                    </span>
                                </div>

                                <div className="password-strength-bars">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div
                                            key={index}
                                            className={`password-strength-bar ${index < passwordStrength ? 'active' : ''}`}
                                            style={{
                                                backgroundColor:
                                                    index < passwordStrength
                                                        ? getStrengthColor()
                                                        : '#e5e7eb'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="signup-form-group">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`signup-submit-btn ${isLoading ? 'loading' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="signup-loading">
                                        <span className="signup-spinner"></span>
                                        Creating Account...
                                    </span>
                                ) : (
                                    <strong>Create Account</strong>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="signup-footer">
                        <p className="signup-footer-text">
                            Already have an account?{' '}
                            <Link to="/login" className="signup-login-link">
                                <strong>Sign in</strong>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
