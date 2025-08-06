import React from 'react';
import './ImageSection.css';

const ImageTextSection = ({ imageSrc, title, content }) => {
  return (
    <div className="image-text-section">
      <div className="image-column">
        <img src={imageSrc} alt={title} className="section-image" />
      </div>

      <div className="text-column">
        <h1 className="section-title">{title}</h1>
        <p className="section-content">{content}</p>
      </div>
    </div>
  );
};

export default ImageTextSection;
