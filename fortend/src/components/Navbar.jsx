import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  
 
  const navLinks = [
    {
      to: "/",
      icon: "🏠",
      text: "Home",
      exact: true
    },
    {
      to: "/tasks",
      icon: "📋",
      text: "My Tasks",
      exact: false
    },
    {
      to: "/tasks/add",
      icon: "➕",
      text: "Add Task",
      exact: false
    }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
       
        <div 
          className="navbar-brand"
          onClick={() => navigate("/")}
          style={{ cursor: 'pointer' }}
        >
          <div className="navbar-logo">
            <span style={{ fontSize: '1.5rem' }}>✓</span>
          </div>
          <h1 className="navbar-title">TaskTracker</h1>
        </div>
        
        <div className="navbar-links">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) => 
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-text">{link.text}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;