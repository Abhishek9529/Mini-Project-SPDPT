import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="spdpt-footer">
      <div className="footer-glow"></div>
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <h2>SPDPT</h2>
            <p>Empowering students to track, manage, and accomplish their daily goals with smart analytics.</p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3>Product</h3>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/goals">Goals</Link></li>
              <li><Link to="/tasks">Tasks</Link></li>
              <li><Link to="/subjects">Subjects</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-links">
            <h3>Company</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h3>Stay Updated</h3>
            <p>Subscribe for updates and productivity tips.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} SPDPT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
