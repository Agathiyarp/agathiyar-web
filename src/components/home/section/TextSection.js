import React from 'react';
import './TextSection.css';

const TextSection = ({ title, description, image }) => {
  return (
    <div className="text-section">
      <div className="text-section-container">
        <h1 className="text-title">{title}</h1>
        <p className="text-section-content">{description}</p>
      </div>

      <div className="text-image-column">
        <img src={image} alt={title} className="text-section-image" />
      </div>
    </div>
  );
};

export default TextSection;