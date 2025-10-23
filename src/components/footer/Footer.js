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
        {/* <div className="footer-links">
          <a onClick={(e) => e.preventDefault()}>Subscribe us on YouTube</a>
        </div> */}
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Copyrights Owned by AgathiyarPyramid.org. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;