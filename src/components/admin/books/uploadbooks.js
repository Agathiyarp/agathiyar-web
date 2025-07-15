import React, { useState } from 'react';
import './uploadbooks.css';
import MenuBar from '../../menumain/menubar';

export default function UploadBooks() {
  const [filename, setFilename] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setMessage('');
    } else {
      setPdfFile(null);
      setMessage('Please select a valid PDF file.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setMessage('');
    } else {
      setImageFile(null);
      setImagePreview(null);
      setMessage('Please select a valid image file.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!filename.trim()) {
      setMessage('Filename is required.');
      return;
    }

    if (!pdfFile) {
      setMessage('Please select a PDF file.');
      return;
    }

    if (!imageFile) {
      setMessage('Please select a cover image.');
      return;
    }

    // Simulate "upload"
    console.log('Uploading:');
    console.log('Custom Filename:', filename);
    console.log('Selected PDF:', pdfFile);
    console.log('Selected Image:', imageFile);

    setMessage(`Uploaded "${filename}" with PDF "${pdfFile.name}" and image "${imageFile.name}" successfully!`);

    // Reset
    setFilename('');
    setPdfFile(null);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="upload-container">
      <MenuBar />
      <h2>Upload Book</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Enter custom filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="upload-input"
        />

        <label className="upload-label">Select PDF File:</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePdfChange}
          className="upload-input"
        />

        <label className="upload-label">Select Cover Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="upload-input"
        />

        <button type="submit" className="upload-button">
          Upload
        </button>
      </form>

      {message && <p className="upload-message">{message}</p>}

      {pdfFile && (
        <div className="upload-preview">
          <p><strong>Selected PDF:</strong> {pdfFile.name}</p>
        </div>
      )}

      {imagePreview && (
        <div className="upload-preview">
          <p><strong>Cover Image Preview:</strong></p>
          <img src={imagePreview} alt="Cover Preview" className="image-preview" />
        </div>
      )}
    </div>
  );
}
