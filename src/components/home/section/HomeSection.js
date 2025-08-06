import React from 'react';
import './HomeSection.css';

const HomeSection = ({ title, description, image}) => {
  return (
    <div className="home-section">
      <div className="home-left">
        <h1 className="home-title">{title}</h1>
        <p>
          {description}
        </p>
      </div>

      <div className="home-right">
        <img src={image} alt="Meditation" className="home-image" />
      </div>
    </div>
  );
};

export default HomeSection;
