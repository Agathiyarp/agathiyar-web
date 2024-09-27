import React from 'react';
import './ImageGallery.css'; // Make sure to create this CSS file
import image from '../images/image3.png';

const ImageGallery = () => {
  const images = [
    image,
    image,
    image,
    image,
    // Add more image URLs as needed
  ];

  return (
    <div className="image-gallery">
      {images.map((url, index) => (
        <div key={index} className="image-container">
          <img src={url} alt={`Gallery item ${index + 1}`} className="gallery-image" />
          <div className="frame" />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;