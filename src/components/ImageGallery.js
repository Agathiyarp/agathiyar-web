import React from 'react';
import './ImageGallery.css'; // Make sure to create this CSS file
import image1 from '../images/Ganesha_Pyramid.png'
import image2 from '../images/Mercaba_Pyramid.png'
import image3 from '../images/Agathiyar_Pyramid.png'

const ImageGallery = () => {
  const images = [
    image1,
    image2,
    image3,
    // Add more image URLs as needed
  ];
  const name=["Ganesha Pyramid", "Muruga Merkaba Pyramid", "Agathiyar Pyramid"];
  return (
    <div className="gallery">
    {images.map((url, index) => (
      <div className="gallery-item" key={index}>
        <img src={url} alt={`Gallery item ${index + 1}`} className="gallery-image" />
        <h3 className="gallery-title">{name[index]}</h3>
      </div>
    ))}
  </div>
  );
};

export default ImageGallery;