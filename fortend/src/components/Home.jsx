import React from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";
import Navbar from './Navbar';

const Home = () => {
  return (
  
    <div className="home-container">
      
      <h1 className="welcome-title">Welcome to TaskTracker</h1>
      <p className="welcome-text">
        Your personal productivity companion. Organize tasks, track progress, 
        and achieve your goals efficiently with our intuitive task management system.
      </p>

      <div className="cta-section">
        <Link to="/tasks" className="cta-button">
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;