import React, { useState, useRef } from "react";
import "./uploadbooks.css";
import MenuBar from "../../menumain/menubar";

export default function UploadBooks() {
  const [filename, setFilename] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setMessage("");
    } else {
      setPdfFile(null);
      setMessage("Please select a valid PDF file.");
    }
  };

  const handleClear = () => {
    setPdfFile(null);
    setImageFile(null);
    setImagePreview(null);
    setMessage('');
    setFilename('');
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setMessage("");
    } else {
      setImageFile(null);
      setImagePreview(null);
      setMessage("Please select a valid image file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!filename.trim()) {
      setMessage("Filename is required.");
      return;
    }

    if (!pdfFile) {
      setMessage("Please select a PDF file.");
      return;
    }

    if (!imageFile) {
      setMessage("Please select a cover image.");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", filename);
      formData.append("file", pdfFile);
      formData.append("image", imageFile);

      const response = await fetch(
        "https://www.agathiyarpyramid.org/api/uploadbook",
        {
          method: "POST",
          body: formData,
        }
      );

      const resultMessage = await response.text();

      if (!response.ok) {
        throw new Error(resultMessage || 'Upload failed');
      }

      setMessage(`✅ ${resultMessage}`);
      alert(`Book "${filename}" uploaded successfully!`);
      setFilename('');
      setPdfFile(null);
      setImageFile(null);
      setImagePreview(null);

      if (pdfInputRef.current) pdfInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
          ref={pdfInputRef}
        />

        <label className="upload-label">Select Cover Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="upload-input"
          ref={imageInputRef}
        />

        {isLoading ? (
          <button type="button" className="upload-button" disabled>
            Uploading...
          </button>
        ) : (
          <button type="submit" className="upload-button">
            Upload
          </button>
        )}

      </form>

      {message && <p className="upload-message">{message}</p>}

      {(pdfFile || imagePreview) && (
        <div className="upload-preview">
          {pdfFile && (
            <p>
              <strong>Selected PDF:</strong> {pdfFile.name}
            </p>
          )}

          {imagePreview && (
            <>
              <p>
                <strong>Cover Image Preview:</strong>
              </p>
              <img
                src={imagePreview}
                alt="Cover Preview"
                className="image-preview"
              />
            </>
          )}

          <button onClick={handleClear} className="clear-button">
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
