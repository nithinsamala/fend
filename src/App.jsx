// App.js - Simplified version
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check`, {
        withCredentials: true
      });
      setIsAuthenticated(response.data.isAuthenticated);
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login page that redirects to chat if already authenticated
  const LoginPage = () => {
    if (isLoading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (isAuthenticated) {
      return <Navigate to="/chat" replace />;
    }
    
    return <Login onLoginSuccess={(userData) => {
      setIsAuthenticated(true);
      setUser(userData);
    }} />;
  };

  // Signup page that redirects to chat if already authenticated
  const SignupPage = () => {
    if (isLoading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (isAuthenticated) {
      return <Navigate to="/chat" replace />;
    }
    
    return <Signup onSignupSuccess={(userData) => {
      setIsAuthenticated(true);
      setUser(userData);
    }} />;
  };

  // Protected Chat page
  const ChatPage = () => {
    if (isLoading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return <Chat user={user} onLogout={() => {
      setIsAuthenticated(false);
      setUser(null);
      // You might want to call logout API here too
    }} />;
  };

  if (isLoading) {
    return <div className="app-loading">Loading application...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;