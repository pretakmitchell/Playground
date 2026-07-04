import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <div className="logo-placeholder">
        <img src="/dmd-logo.png" alt="DMD Logo" className="header-logo" />
      </div>
      
      <div className="header-actions">
        <a href="#signup" className="glass-panel header-button">
          Keep Me updated
        </a>
      </div>
    </header>
  );
};

export default Header;
