import React from 'react';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import './Landing.css';

const Terms = () => {
  return (
    <div className="landing-page">
      <LandingNav />
      <section className="hero-section info-hero-section">
        <div className="hero-bg-glow1"></div>
        <div className="hero-content info-hero-content">
          <h1 className="hero-title">Terms of <span className="highlight-text">Service</span></h1>
          <div style={{ maxWidth: '800px', margin: '2rem auto 0', textAlign: 'left', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '1rem' }}>Last updated: {new Date().getFullYear()}</p>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h3>
            <p style={{ marginBottom: '1.5rem' }}>By accessing and using SPDPT, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. User Account</h3>
            <p style={{ marginBottom: '1.5rem' }}>If you create an account on the application, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account.</p>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Disclaimer</h3>
            <p style={{ marginBottom: '1.5rem' }}>The materials on SPDPT's application are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Terms;
