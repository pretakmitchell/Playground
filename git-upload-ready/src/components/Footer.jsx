import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-content">
        <div className="footer-logo-placeholder">
          <img src="/dmd-logo.png" alt="DMD Logo Large" className="footer-logo-img" />
        </div>
        <div className="footer-text">
          <h2>The Department of</h2>
          <img src="/mythical-detection-2.png" alt="Mythical Detection" className="footer-title-img" />
          <p className="text-secondary footer-desc">
            Monitoring magical activity across the globe. Working with junior agents to separate myth from reality.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
