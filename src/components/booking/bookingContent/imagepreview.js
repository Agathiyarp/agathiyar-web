import React, { useState, useEffect } from "react";
import "./imagepreview.css";

const ImagePreview = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleOrientation = () => {
    setIsHorizontal((prev) => !prev);
  };

  return (
    <div className="image-preview-modal">
      <div className="image-preview-overlay" onClick={onClose}></div>
      <div className={`image-preview-content ${isHorizontal ? "horizontal-layout" : ""}`}>
        <div className="image-preview-header">
          <button className="close-btn" onClick={onClose}>✕</button>
          <h2 className="preview-title">
            {currentIndex + 1} / {images.length}
          </h2>
          <div className="view-controls">
            <button
              className="view-btn"
              onClick={toggleOrientation}
              title={isHorizontal ? "Vertical View" : "Horizontal View"}
            >
              {isHorizontal ? "↕" : "↔"}
            </button>
          </div>
        </div>

        <div className="main-image-container">
          <button className="nav-btn prev-btn" onClick={goToPrevious}>‹</button>

          <div className="image-wrapper">
            <img
              src={images[currentIndex]}
              alt={`preview-${currentIndex}`}
              className="main-preview-image"
              style={{
                objectFit: "contain", // always contain for simplicity now
              }}
            />
          </div>

          <button className="nav-btn next-btn" onClick={goToNext}>›</button>
        </div>

        <div className="thumbnail-container">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`thumbnail-${i}`}
              className={`thumbnail ${i === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
