import React, { useState, useRef, useEffect } from 'react';
import './imageupload.css';
import MenuBar from '../../menumain/menubar';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 20;

const ImageUpload = () => {
  const [filesData, setFilesData] = useState([]);
  const [errors, setErrors] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const fileInputRef = useRef(null);

  /* ================= FETCH GALLERY IMAGES ================= */
  const fetchGalleryImages = async () => {
    try {
      const res = await fetch(
        'https://www.agathiyarpyramid.org/api/get-gallery-images'
      );
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setGalleryImages(data);
      } else {
        setGalleryImages([]);
      }
    } catch (err) {
      console.error('Error fetching gallery images', err);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  /* ================= DELETE IMAGE ================= */
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const res = await fetch(
        `https://www.agathiyarpyramid.org/api/delete-gallery-image/${id}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        fetchGalleryImages();
      } else {
        alert('Failed to delete image');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while deleting');
    }
  };

  /* ================= FILE UPLOAD ================= */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let errorMsg = '';
    const combinedFilesCount = filesData.length + selectedFiles.length;

    if (combinedFilesCount > MAX_FILES) {
      errorMsg = `You can only upload up to ${MAX_FILES} images at once.`;
      setErrors(errorMsg);
      alert(errorMsg);
      fileInputRef.current.value = '';
      return;
    }

    const newValidFiles = [];

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        errorMsg = 'Only image files are allowed.';
      } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errorMsg = `File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB.`;
      } else {
        newValidFiles.push({ file, name: '' });
      }
    });

    if (errorMsg) {
      setErrors(errorMsg);
    } else {
      setFilesData((prev) => [...prev, ...newValidFiles]);
      setErrors('');
    }

    fileInputRef.current.value = '';
  };

  const handleNameChange = (index, value) => {
    const updatedFiles = [...filesData];
    updatedFiles[index].name = value;
    setFilesData(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (filesData.length === 0) {
      setErrors('Please upload at least one image.');
      return;
    }

    const formData = new FormData();
    filesData.forEach(({ file, name }) => {
      formData.append('images[]', file);
      formData.append('names[]', name || file.name);
    });

    try {
      const res = await fetch(
        'https://www.agathiyarpyramid.org/api/upload-gallery-images',
        { method: 'POST', body: formData }
      );

      if (res.ok) {
        alert('Images uploaded successfully');
        setFilesData([]);
        fetchGalleryImages();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  /* ================= UI ================= */
  return (
    <div className="imageupload-container">
      <MenuBar />

      <h2 className="upload-image-text">Upload Images</h2>

      <form onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />

        {filesData.map((fileObj, idx) => (
          <div className="image-name-block" key={idx}>
            <p>
              <strong>Image:</strong> {fileObj.file.name}
            </p>
            <input
              type="text"
              placeholder="Enter custom name (optional)"
              value={fileObj.name}
              onChange={(e) => handleNameChange(idx, e.target.value)}
              className="input-field"
            />
          </div>
        ))}

        {errors && <p className="error-text1">{errors}</p>}

        <button type="submit" className="upload-btn">
          Submit
        </button>
      </form>

      {/* ================= GALLERY LIST ================= */}
      <div className="gallery-list-container">
        <h2>Uploaded Images List</h2>

        {galleryImages.length === 0 ? (
          <p className="empty-text">No images uploaded yet.</p>
        ) : (
          <ul className="gallery-list">
            {galleryImages.map((img) => (
              <li key={img.id} className="gallery-item">
                <img
                  src={`https://www.agathiyarpyramid.org${img.filepath}`}
                  alt={img.name}
                />

                <div className="gallery-info">
                  <p>{img.name}</p>
                  <button
                    className="delete-btn2"
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;