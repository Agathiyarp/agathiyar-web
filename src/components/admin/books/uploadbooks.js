import React, { useState } from 'react';
import './uploadbooks.css';
import MenuBar from '../../menumain/menubar';

export default function UploadBooks() {
  const [filename, setFilename] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setMessage('');
    } else {
      setPdfFile(null);
      setMessage('Please select a valid PDF file.');
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

    // Simulate "upload"
    console.log('Uploading:');
    console.log('Custom Filename:', filename);
    console.log('Selected File:', pdfFile);

    // Here you would typically send the file to your server or API
    setMessage(`Uploaded "${filename}" with file "${pdfFile.name}" successfully!`);

    // Reset
    setFilename('');
    setPdfFile(null);
  };

  return (
    <div className="upload-container">
      <MenuBar />
      <h2>Upload PDF Book</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Enter custom filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="upload-input"
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="upload-input"
        />

        <button type="submit" className="upload-button">
          Upload
        </button>
      </form>

      {message && <p className="upload-message">{message}</p>}

      {pdfFile && (
        <div className="upload-preview">
          <p><strong>Selected File:</strong> {pdfFile.name}</p>
        </div>
      )}
    </div>
  );
}
