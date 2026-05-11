import React from 'react';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import './Landing.css';

const Privacy = () => {
  return (
    <div className="landing-page">
      <LandingNav />
      <section className="hero-section info-hero-section">
        <div className="hero-bg-glow1"></div>
        <div className="hero-content info-hero-content">
          <h1 className="hero-title">Privacy <span className="highlight-text">Policy</span></h1>
          <div style={{ maxWidth: '800px', margin: '2rem auto 0', textAlign: 'left', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '1rem' }}>Last updated: {new Date().getFullYear()}</p>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Information We Collect</h3>
            <p style={{ marginBottom: '1.5rem' }}>We collect information you provide directly to us, such as when you create or modify your account, or interact with the SPDPT services.</p>
            
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Use of Information</h3>
            <p style={{ marginBottom: '1.5rem' }}>We use the information we collect to provide, maintain, and improve our services, such as to personalize your dashboard and productivity metrics.</p>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Data Security</h3>
            <p style={{ marginBottom: '1.5rem' }}>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Privacy;
