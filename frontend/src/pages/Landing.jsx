import React from 'react';
import { Link } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <LandingNav />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-glow1"></div>
        <div className="hero-bg-glow2"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Take Control of Your <span className="highlight-text">Daily Goals</span>
          </h1>
          <p className="hero-subtitle">
            SPDPT is the ultimate student productivity dashboard. Track your subjects, manage tasks, and visualize your progress all in one place.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary">Start Tracking Now</Link>
            <Link to="/login" className="btn-tertiary">Login</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Everything You Need to Succeed</h2>
          <p>Powerful tools designed specifically for students to maximize productivity.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <h3>Smart Dashboard</h3>
            <p>Get a bird's eye view of your entire academic life. Track task completion rates and subject progress.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3>Daily Planning</h3>
            <p>Plan your 'My Day' efficiently. Set specific hours for subjects and never miss a deadline.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3>Goal Tracking</h3>
            <p>Set long-term goals and break them down into actionable daily tasks to ensure consistent progress.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
        </div>
        
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Profile</h3>
              <p>Sign up and set your academic goals and subjects.</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Plan Your Day</h3>
              <p>Add tasks and allocate time to specific subjects in your dashboard.</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Track Progress</h3>
              <p>Check off tasks and watch your productivity analytics grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to boost your productivity?</h2>
          <p>Join SPDPT today and transform the way you study.</p>
          <Link to="/register" className="btn-primary large">Create Free Account</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
