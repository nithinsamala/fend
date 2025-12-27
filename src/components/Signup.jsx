import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const API_URL = import.meta.env.VITE_API_URL;

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /* =========================
     CHECK AUTH ON LOAD
  ========================= */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/check`, {
          withCredentials: true
        });
        if (res.data.isAuthenticated) {
          navigate("/chat");
        }
      } catch {
        // Not logged in → do nothing
      }
    };
    checkAuth();
  }, [navigate]);

  /* =========================
     PASSWORD STRENGTH
  ========================= */
  useEffect(() => {
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 1) strength++;
    if (pwd.length >= 6) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    setPasswordStrength(Math.min(strength, 4));
  }, [formData.password]);

  /* =========================
     INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================
     SUBMIT SIGNUP
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post(
        `${API_URL}/api/signup`,
        {
          email: formData.email,
          password: formData.password
        },
        { withCredentials: true }
      );

      setMessage({
        type: "success",
        text: "Account created successfully!"
      });

      if (onSignupSuccess) {
        onSignupSuccess(res.data.user);
      }

      navigate("/chat");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Signup failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     UI
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
            />

            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
