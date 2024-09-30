import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p>
            Agathiyar Pyramid Dhyana Ashram, Near Ramanaickenpettai, Vaniyambadi,
            Tirupathur District, Tamilnadu - 635801
          </p>
          <p>Mobile: +91 85250 44990</p>
        </div>
        <div className="footer-links">
          <a href="#about">Click Here</a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">Subscribe us on YouTube</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Copyrights Owned by AgathiyarPyramid.com. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;