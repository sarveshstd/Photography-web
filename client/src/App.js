import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentLogin from "./pages/StudentLogin";
import CoordinatorLogin from "./pages/CoordinatorLogin";
import StudentGallery from "./pages/StudentGallery";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <div className="intro-container">
        <img
          src="/assets/event-logo.png"
          alt="Event Logo"
          className="intro-logo"
        />
      </div>
    );
  }

  return (
    <Router>
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
    </Router>
  );
}

export default App;