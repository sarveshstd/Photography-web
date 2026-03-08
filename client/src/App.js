import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import StudentLogin from './pages/StudentLogin';
import CoordinatorLogin from './pages/CoordinatorLogin';
import StudentGallery from './pages/StudentGallery';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);

  useEffect(() => {
    // Start intro animation - faster and smoother
    const timer = setTimeout(() => {
      setShowIntro(false);
      // Immediate transition to main content
      setShowMainContent(true);
    }, 1500); // 1.5 second intro animation - faster zoom

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {/* Intro Animation */}
      {showIntro && (
        <div className="intro-container">
          <img
            src="/assets/event-logo.png"
            alt="Event Logo"
            className="intro-logo"
          />
        </div>
      )}

      {/* Main Content - appears immediately after intro */}
      {showMainContent && (
        <div className="main-content-fade">
          <div className="floating-shapes">
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
          </div>
          <Routes>
            <Route path="/" element={<StudentLogin />} />
            <Route path="/coordinator" element={<CoordinatorLogin />} />
            <Route path="/gallery" element={<StudentGallery />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;
