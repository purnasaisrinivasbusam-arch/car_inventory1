import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

export default function Welcome() {
  return (
    <div className="welcome-container">

      <div className="welcome-content">
        <h1>Welcome to Car Portal</h1>
    

        <div className="welcome-buttons">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      </div>
      <div className="features-section">
        <div className="feature-block">
          <h3>Track Vehicles</h3>
          <p>Easily track all vehicles entering and leaving the premises in real-time.</p>
        </div>
        <div className="feature-block">
          <h3>Manage Records</h3>
          <p>Maintain a detailed history of all vehicle movements and access it anytime.</p>
        </div>
        <div className="feature-block">
          <h3>Generate Reports</h3>
          <p>Generate insightful reports to analyze vehicle movement patterns.</p>
        </div>
      </div>
    </div>
  );
}