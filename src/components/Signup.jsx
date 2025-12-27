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
          navigate("/chat");
        }
      } catch {
        // normal if not logged in
      }
    };

    checkIfLoggedIn();
  }, [API_URL, navigate]);

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
     INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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
        text: "Account created successfully! Redirecting..."
      });

      if (onSignupSuccess) {
        onSignupSuccess(res.data.user);
      }

      navigate("/chat");
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Signup failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     UI HELPERS
  ========================= */
  const getStrengthColor = () => {
    if (passwordStrength === 0) return "gray";
    if (passwordStrength === 1) return "#ef4444";
    if (passwordStrength === 2) return "#f97316";
    if (passwordStrength === 3) return "#eab308";
    return "#22c55e";
  };

  const getStrengthText = () => {
    const texts = ["", "Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
    return texts[passwordStrength] || "";
  };

  /* =========================
     RENDER
  ========================= */
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
            <div
              className={`signup-message ${
                message.type === "success" ? "success" : "error"
              }`}
            >
              {message.text}
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-form-group">
              <label className="signup-label"><strong>Email</strong></label>
              <div className="signup-input-container">
                <input
                  name="email"
                  type="email"
                  required
                  className="signup-input"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="signup-form-group">
              <label className="signup-label"><strong>Password</strong></label>
              <div className="signup-input-container">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="signup-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>

              <div className="password-strength-container">
                <div className="password-strength-header">
                  <span>Password Strength</span>
                  <span style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`signup-submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account?{" "}
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
