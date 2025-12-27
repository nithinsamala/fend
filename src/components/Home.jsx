import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const features = [
    {
      icon: '🤖',
      title: 'AI Assistant',
      description: 'Intelligent chatbot with natural conversation',
      color: '#4A90E2'
    },
    {
      icon: '⚡',
      title: 'Fast Responses',
      description: 'Instant replies with smooth performance',
      color: '#34C759'
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'Enterprise-grade security and privacy',
      color: '#FF9500'
    },
    {
      icon: '🎨',
      title: 'Clean Interface',
      description: 'Minimal and user-friendly design',
      color: '#5AC8FA'
    }
  ];

  return (
    <div className="home-page">
      {/* Fixed Navigation */}
      <nav className={`fixed-nav`}>
        <div className="nav-container">
          {/* Logo */}
          <div className="logo-section" onClick={() => navigate('/')}>
            <div className="logo-icon">S</div>
            <div className="logo-text">
              <div className="logo-primary">SmartBot</div>
              <div className="logo-secondary">AI Chat Platform</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            <button 
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveSection('home')}
            >
              <span>🏠</span>
              <span>Home</span>
            </button>
            <button 
              className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
              onClick={() => setActiveSection('features')}
            >
              <span>⭐</span>
              <span>Features</span>
            </button>
            <button 
              className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => setActiveSection('about')}
            >
              <span>ℹ️</span>
              <span>About</span>
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="nav-actions">
            <button className="notification-btn">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="login-btn" onClick={() => navigate('/login')}>
              <span>🔑</span>
              <span>Login</span>
            </button>
            <button className="signup-btn" onClick={() => navigate('/signup')}>
              <span>👤</span>
              <span>Sign Up</span>
            </button>
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <div className="mobile-user">
                <div className="mobile-avatar">👤</div>
                <div>
                  <div className="mobile-welcome">Welcome Guest</div>
                  <div className="mobile-hint">Sign in for full access</div>
                </div>
              </div>
              <div className="mobile-links">
                <button className="mobile-link" onClick={() => { setIsMenuOpen(false); setActiveSection('home'); }}>
                  <span>🏠</span>
                  <span>Home</span>
                </button>
                <button className="mobile-link" onClick={() => { setIsMenuOpen(false); setActiveSection('features'); }}>
                  <span>⭐</span>
                  <span>Features</span>
                </button>
                <button className="mobile-link" onClick={() => { setIsMenuOpen(false); setActiveSection('about'); }}>
                  <span>ℹ️</span>
                  <span>About</span>
                </button>
                <div className="mobile-divider"></div>
                <button className="mobile-link" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                  <span>🔑</span>
                  <span>Login</span>
                </button>
                <button className="mobile-link signup" onClick={() => { setIsMenuOpen(false); navigate('/signup'); }}>
                  <span>👤</span>
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                NEXT-GEN AI PLATFORM
              </div>
              <h1 className="hero-title">
                Intelligent Chat Made
                <span>Simple & Powerful</span>
              </h1>
              <p className="hero-subtitle">
                Experience the future of customer engagement with our AI-powered chatbot platform. 
                Smart responses, clean design, and seamless integration.
              </p>
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => navigate('/chat')}>
                  <span>🤖</span>
                  <span>Start Chatting</span>
                </button>
                <button className="secondary-btn" onClick={() => navigate('/signup')}>
                  <span>👤</span>
                  <span>Free Trial</span>
                </button>
                <button className="video-btn">
                  <span>▶️</span>
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card">
                <div className="card-header">
                  <div className="card-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <div className="card-title">Live Chat Preview</div>
                </div>
                <div className="card-messages">
                  <div className="message-preview bot">
                    <div className="preview-avatar">🤖</div>
                    <div className="preview-content">
                      Hello! How can I assist you today?
                    </div>
                  </div>
                  <div className="message-preview user">
                    <div className="preview-content">
                      Show me the analytics dashboard
                    </div>
                    <div className="preview-avatar">👤</div>
                  </div>
                  <div className="message-preview bot typing">
                    <div className="preview-avatar">🤖</div>
                    <div className="preview-content">
                      <span className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </div>
                  </div>
                </div>
                <button className="chat-launch-btn" onClick={() => navigate('/chat')}>
                  <span>🚀</span>
                  Launch Full Chat
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">
              Everything You Need for
              <span> Modern Communication</span>
            </h2>
            <p className="section-subtitle">
              Powerful features designed to enhance your customer experience
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div 
                  className="feature-icon-wrapper"
                  style={{ background: feature.color }}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <button className="feature-link" onClick={() => navigate('/chat')}>
                  Try Now <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <div className="cta-text">
              <h2 className="cta-title">
                Ready to Experience Smart Chat?
              </h2>
              <p className="cta-subtitle">
                Join our platform and transform how you communicate with customers
              </p>
            </div>
            <div className="cta-actions">
              <button className="cta-primary-btn" onClick={() => navigate('/signup')}>
                <span>👤</span>
                <span>Get Started Free</span>
              </button>
              <button className="cta-secondary-btn" onClick={() => navigate('/chat')}>
                <span>🤖</span>
                <span>Try Live Demo</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}