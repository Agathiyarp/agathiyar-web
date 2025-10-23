import React, { useState, useRef } from 'react';
import './imageupload.css';
import MenuBar from '../../menumain/menubar';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 20;

const ImageUpload = () => {
  const [filesData, setFilesData] = useState([]); // [{ file, name }]
  const [errors, setErrors] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let errorMsg = '';
    const combinedFilesCount = filesData.length + selectedFiles.length;

    if (combinedFilesCount > MAX_FILES) {
      errorMsg = `You can only upload up to ${MAX_FILES} images at once.`;
      setErrors(errorMsg);
      alert(errorMsg);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
  };

  const handleNameChange = (index, value) => {
    const updatedFiles = [...filesData];
    updatedFiles[index].name = value;
    setFilesData(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (filesData.length === 0) {
      setErrors('Please upload at least one valid image.');
      return;
    }

    const formData = new FormData();
    filesData.forEach(({ file, name }) => {
      formData.append('images[]', file);
      formData.append('names[]', name || file.name); // fallback to original name
    });

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/upload-gallery-images', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Upload successful: ${data.message || 'Images uploaded.'}`);
        setFilesData([]);
        setErrors('');
      } else {
        alert('Upload failed');
        setErrors(data.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      alert('Something went wrong while uploading.');
      setErrors('Something went wrong while uploading.');
      console.error(err);
    }
  };

  return (
    <div className="upload-container">
      <MenuBar />
      <h2 className='upload-image-text'>Upload Images</h2>

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
            <p><strong>Image:</strong> {fileObj.file.name}</p>
            <input
              type="text"
              placeholder="Enter custom name (optional)"
              value={fileObj.name}
              onChange={(e) => handleNameChange(idx, e.target.value)}
              className="input-field"
            />
          </div>
        ))}

        {errors && <p className="error-text">{errors}</p>}

        <button type="submit" className="upload-btn">Submit</button>
      </form>
    </div>
  );
};

export default ImageUpload;
