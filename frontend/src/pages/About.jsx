import React from 'react';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import './Landing.css'; // Reuse landing CSS for consistent styling

const About = () => {
  return (
    <div className="landing-page">
      <LandingNav />
      <section className="hero-section info-hero-section">
        <div className="hero-bg-glow1"></div>
        <div className="hero-content info-hero-content">
          <h1 className="hero-title">About <span className="highlight-text">SPDPT</span></h1>
          <p className="hero-subtitle" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', marginTop: '2rem' }}>
            SPDPT is designed to be the ultimate student productivity dashboard. Our mission is to empower students by helping them track their subjects, manage daily tasks, and visualize their progress effectively. 
            <br /><br />
            We believe that consistent daily planning and clear goal tracking are the keys to academic success. With SPDPT, you can seamlessly organize your 'My Day', monitor your task completion rates, and stay on top of your long-term goals without feeling overwhelmed.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
