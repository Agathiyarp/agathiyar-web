import React from "react";
import "./imagepreview.css";

const ImagePreview = ({ images, onClose }) => {
  return (
    <div className="image-preview-modal">
      <div className="image-preview-header">
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2 className="preview-title">Image Preview</h2>
      </div>
      <div className="image-gallery">
        {images.map((src, i) => (
          <img key={i} src={src} alt={`preview-${i}`} />
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
