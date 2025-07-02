import React, { useState } from 'react';
import Modal from 'react-modal';
import './gallery.css';
import MenuBar from "../menumain/menubar";
import Footer from "../Footer";

import img1 from '../../images/gallery/gallery1.png';
import img2 from '../../images/gallery/gallery2.png';
import img3 from '../../images/gallery/gallery3.png';
import img4 from '../../images/gallery/gallery4.png';
import img5 from '../../images/gallery/gallery5.png';
import img6 from '../../images/gallery/gallery6.png';

const images = [img1, img2, img3, img4, img5, img6];

Modal.setAppElement('#root'); // or your app's top-level div

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="gallery-page">
      <MenuBar />
      <h2>Image Gallery</h2>

      <div className="gallery-grid">
        {images.map((img, idx) => (
          <div key={idx} className="gallery-tile" onClick={() => setSelectedImage(img)}>
            <img src={img} alt={`Gallery ${idx}`} className="gallery-thumbnail" />
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedImage}
        onRequestClose={() => setSelectedImage(null)}
        contentLabel="Image Preview"
        className="gallery-modal"
        overlayClassName="gallery-overlay"
        closeTimeoutMS={200}
      >
        <button className="gallery-close-button" onClick={() => setSelectedImage(null)}>
          &times;
        </button>
        <img src={selectedImage} alt="Full" className="gallery-full-image" />
      </Modal>

      <Footer />
    </div>
  );
}
