import React, { useState } from 'react';
import './videoupload.css';
import MenuBar from '../../menumain/menubar';

export default function VideoUpload() {
  const [videoName, setVideoName] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [message, setMessage] = useState('');
  const [submittedLink, setSubmittedLink] = useState('');

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!videoName.trim()) {
      setMessage('Video name is required.');
      return;
    }

    if (!videoLink.trim()) {
      setMessage('Video link is required.');
      return;
    }

    if (!validateURL(videoLink)) {
      setMessage('Please enter a valid URL.');
      return;
    }

    // Simulate upload/save
    console.log('Uploading:');
    console.log('Video Name:', videoName);
    console.log('Video Link:', videoLink);

    setMessage(`Uploaded "${videoName}" with link successfully!`);
    setSubmittedLink(videoLink);

    // Reset form fields
    setVideoName('');
    setVideoLink('');
  };

  const handleClear = () => {
    setSubmittedLink('');
    setMessage('');
  };

  return (
    <div className="upload-container">
      <MenuBar />
      <h2>Add Video Link</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Enter video name"
          value={videoName}
          onChange={(e) => setVideoName(e.target.value)}
          className="upload-input"
        />

        <input
          type="text"
          placeholder="Enter video link (e.g., YouTube URL)"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          className="upload-input"
        />

        <button type="submit" className="upload-button">
          Add Video
        </button>
      </form>

      {message && <p className="upload-message">{message}</p>}

      {submittedLink && (
        <div className="upload-preview">
          <p><strong>Video Link Added:</strong> {submittedLink}</p>

          {submittedLink.includes('youtube.com') || submittedLink.includes('youtu.be') ? (
            <div className="video-embed">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${extractYouTubeID(submittedLink)}`}
                title="YouTube video preview"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <p>No preview available for this link.</p>
          )}

          <button onClick={handleClear} className="clear-button">
            Clear Preview
          </button>
        </div>
      )}
    </div>
  );
}

// Helper to extract YouTube video ID
function extractYouTubeID(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }
    return '';
  } catch {
    return '';
  }
}
