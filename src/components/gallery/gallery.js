import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './gallery.css';
import MenuBar from "../menumain/menubar";
import Footer from '../footer/Footer';

Modal.setAppElement('#root');

const BASE_DOMAIN = "https://www.agathiyarpyramid.org/";

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          "https://www.agathiyarpyramid.org/api/get-gallery-images"
        );

        const images = response.data.map(item => ({
          ...item,
          url: `${BASE_DOMAIN}${item.filepath.replace(/^\.?\/*/, '')}`,
          text: item.name
        }));

        setGalleryImages(images);
      } catch (err) {
        console.error("Error fetching gallery images:", err);
      }
    };
    fetchImages();
  }, []);

  const openImage = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const navigateImages = (direction) => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    }
    setSelectedImage(galleryImages[newIndex]);
    setCurrentIndex(newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
     
      switch(e.key) {
        case 'Escape':
          setSelectedImage(null);
          break;
        case 'ArrowLeft':
          navigateImages('prev');
          break;
        case 'ArrowRight':
          navigateImages('next');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex, galleryImages.length]);

  return (
    <div className="gallery-page">
      <MenuBar />
      <h2>Image Gallery</h2>

      <div className="gallery-grid">
        {galleryImages.map((item, idx) => (
          <div
            key={item.id || idx}
            className="gallery-tile"
            onClick={() => openImage(item, idx)}
          >
            {/* Separated Image Container */}
            <div className="gallery-image-container">
              <img
                src={item.url}
                alt={item.text || `Gallery ${idx + 1}`}
                className="gallery-thumbnail"
                onError={(e) => {
                  e.target.src = `${BASE_DOMAIN}galleryall/placeholder.jpg`;
                }}
                loading="lazy"
              />
            </div>
           
            {/* Separated Text Container */}
            <div className="image-text">
              {item.text}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview */}
      <Modal
        isOpen={!!selectedImage}
        onRequestClose={() => setSelectedImage(null)}
        contentLabel="Image Preview"
        className="gallery-modal"
        overlayClassName="gallery-overlay"
        closeTimeoutMS={200}
      >
        <button
          className="gallery-close-button"
          onClick={() => setSelectedImage(null)}
          aria-label="Close gallery"
        >
          &times;
        </button>
       
        <button
          className="modal-nav-button prev"
          onClick={() => navigateImages('prev')}
          aria-label="Previous image"
        >
          &#10094;
        </button>
       
        {selectedImage && (
          <div className="modal-content-wrapper">
            <div className="modal-image-container">
              <img
                src={selectedImage.url}
                alt={selectedImage.text}
                className="gallery-full-image"
                onError={(e) => {
                  e.target.src = `${BASE_DOMAIN}galleryall/placeholder.jpg`;
                }}
              />
            </div>
            <div className="modal-text-container">
              <p className="modal-text">{selectedImage.text}</p>
            </div>
          </div>
        )}
       
        <button
          className="modal-nav-button next"
          onClick={() => navigateImages('next')}
          aria-label="Next image"
        >
          &#10095;
        </button>
      </Modal>

      <Footer />
    </div>
  );
}