import React, { useState } from 'react';
import Modal from 'react-modal';
import './gallery.css';
import MenuBar from "../menumain/menubar";
import Footer from '../footer/Footer';


const importAll = (r) => r.keys().map(r);
const galleryImages = importAll(require.context('../../images/gallery', false, /\.(png|jpe?g|svg)$/));

Modal.setAppElement('#root'); // or your app's top-level div

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="gallery-page">
      <MenuBar />
      <h2>Image Gallery</h2>

      <div className="gallery-grid">
        {galleryImages.map((img, idx) => (
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
