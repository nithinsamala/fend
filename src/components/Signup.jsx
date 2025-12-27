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

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    if (!API_URL) return;

    const checkIfLoggedIn = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/auth/check`,
          { withCredentials: true }
        );

        if (res.data?.isAuthenticated) {
          navigate('/chat');
        }
      } catch (err) {
        console.log('Auth check error:', err?.response?.status);
      }
    };

    checkIfLoggedIn();
  }, [navigate]);

  /* =========================
     PASSWORD STRENGTH
  ========================= */
  useEffect(() => {
    const calculateStrength = (pwd) => {
      let strength = 0;
      if (pwd.length > 0) strength++;
      if (pwd.length >= 6) strength++;
      if (/[A-Z]/.test(pwd)) strength++;
      if (/[0-9]/.test(pwd)) strength++;
      if (/[^A-Za-z0-9]/.test(pwd)) strength++;
      return Math.min(strength, 5);
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  /* =========================
     INPUT HANDLER
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post(
        `${API_URL}/api/signup`,
        formData,
        { withCredentials: true }
      );

      setMessage({
        type: 'success',
        text: 'Account created successfully! Redirecting...'
      });

      if (onSignupSuccess) {
        onSignupSuccess(res.data.user);
      }

      // store ONLY user (cookie handles auth)
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/chat');

    } catch (err) {
      console.log('Signup error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Signup failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     UI HELPERS
  ========================= */
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444';
    if (passwordStrength === 2) return '#f97316';
    if (passwordStrength === 3) return '#eab308';
    return '#22c55e';
  };

  const getStrengthText = () => {
    return ['', 'Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][passwordStrength];
  };

  /* =========================
     JSX
  ========================= */
  return (
    <div className="signup-page-container">
      <div className="signup-container">
        <div className="signup-card">

          <h1>Create Account</h1>

          {message.text && (
            <div className={`signup-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />

            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>

            <div style={{ color: getStrengthColor() }}>
              Password Strength: {getStrengthText()}
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>

          </form>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;
