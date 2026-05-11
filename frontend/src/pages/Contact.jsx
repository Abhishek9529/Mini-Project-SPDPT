import React from 'react';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import './Landing.css';

const Contact = () => {
  return (
    <div className="landing-page">
      <LandingNav />
      <section className="hero-section info-hero-section">
        <div className="hero-bg-glow1"></div>
        <div className="hero-content info-hero-content">
          <h1 className="hero-title">Contact <span className="highlight-text">Us</span></h1>
          <div style={{ maxWidth: '800px', margin: '2rem auto 0', textAlign: 'left', background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <p className="hero-subtitle" style={{ margin: '0 0 1rem 0' }}>
              We'd love to hear from you! Whether you have a question, feature request, or just want to say hi.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '0.5rem' }}>📧 Email: support@spdpt.com</li>
              <li style={{ marginBottom: '0.5rem' }}>📍 Address: 123 Productivity Ave, Edu City</li>
              <li style={{ marginBottom: '0.5rem' }}>📞 Phone: (555) 123-4567</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
