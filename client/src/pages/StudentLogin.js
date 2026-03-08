import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './StudentLogin.css';

// Allowed 3-letter codes
const ALLOWED_CODES = ['bal', 'bad', 'bam', 'bcb', 'bec', 'bee', 'bit', 'bme', 'bce', 'mca', 'mba'];

export default function StudentLogin() {
  const [registerNumber, setRegisterNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build regex pattern with allowed codes
    const codesPattern = ALLOWED_CODES.join('|');
    // Format: 9276 + 22/23/24/25 + 3 allowed letters + 3 digits (001-400 only)
    // 001-009: 00[1-9]
    // 010-099: 0[1-9][0-9]
    // 100-399: [1-3][0-9]{2}
    // 400: exactly 400
    const registerRegex = new RegExp(`^9276[2][2-5](${codesPattern})(00[1-9]|0[1-9][0-9]|[1-3][0-9]{2}|400)$`, 'i');
    
    if (!registerRegex.test(registerNumber)) {
      alert('Enter proper register number');
      return;
    }
    
    try {
      const res = await api.post('/api/auth/student-login', { registerNumber });
      
      localStorage.setItem('studentToken', res.data.token);
      localStorage.setItem('studentInfo', JSON.stringify(res.data.student));

      navigate('/gallery');
    } catch (err) {
      console.error('Student login error:', err);
      alert(err.response?.data?.message || 'Login failed. Please try again.');
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

      <div className="event-card student-card">
        <h1 className="festival-title">Cultural Photography Contest</h1>
        <p className="subtitle">Vote for the Best Moments of the Event</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Register Number"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
            required
          />

          <button type="submit">Enter Gallery</button>
        </form>

        <p className="coord-link">
          Are you a coordinator? 
          <span onClick={() => navigate('/coordinator')}>
            Login here
          </span>
        </p>
      </div>

    </div>
  );
}
