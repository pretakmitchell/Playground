import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-content">
          <p className="hero-subtitle">The Department of</p>
          <img 
            src="/mythical-detection.png" 
            alt="Mythical Detection" 
            className="hero-title-img"
          />
          <img 
            src="/coming-soon.png" 
            alt="Coming Soon" 
            className="hero-coming-soon-img"
          />
          <p className="hero-description text-primary">
            The Department of Mythical Detection tracks magical activity and investigates the evidence left behind. With the help of Junior Agents around the world, DMD is preparing for its first major operation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
