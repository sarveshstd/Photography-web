import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './CoordinatorLogin.css';

export default function CoordinatorLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/coordinator-login', { username, password });
      
      localStorage.setItem('coordToken', res.data.token);
      localStorage.setItem('coordUsername', username);
      
      navigate('/admin');
    } catch (err) {
      console.error('Coordinator login error:', err);
      alert(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="page-container">
      <div className="overlay"></div>

      <div className="logo-wrapper">
        <img
          src="/assets/event-logo.png"
          alt="Event Logo"
          className="event-logo floating-logo"
          width="120"
        />
      </div>

      <div className="event-card coordinator-card">
        <h1 className="festival-title">Coordinator Portal</h1>
        <p className="subtitle">Manage the Photography Contest</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        <p className="coord-link">
          Are you a student? 
          <span onClick={() => navigate('/')}>
            Login here
          </span>
        </p>
      </div>

    </div>
  );
}
