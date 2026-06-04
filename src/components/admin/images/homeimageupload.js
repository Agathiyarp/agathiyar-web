import React, { useState, useRef, useEffect } from "react";
import "./imageupload.css";
import MenuBar from "../../menumain/menubar";
import { SECTIONS } from "../constant";

const MAX_FILE_SIZE_MB = 20;

const HomeImageUpload = () => {
  const [fileData, setFileData] = useState(null); // ⭐ SINGLE FILE
  const [errors, setErrors] = useState("");
  const [galleryImage, setGalleryImage] = useState(null);
  const [section, setSection] = useState("");
  const fileInputRef = useRef(null);

  /* ================= FETCH GALLERY ================= */
  const fetchGalleryImages = async (selectedSection) => {
    if (!selectedSection) return;

    try {
      const res = await fetch(
        `https://www.agathiyarpyramid.org/api/home/images/${encodeURIComponent(
          selectedSection,
        )}`,
      );

      if (!res.ok) {
        setGalleryImage(null);
        return;
      }

      const data = await res.json();
      setGalleryImage(data && data.id ? data : null);
    } catch (err) {
      console.error(err);
      setGalleryImage(null);
    }
  };

  useEffect(() => {
    fetchGalleryImages(section);
  }, [section]);

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors("Only image files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setErrors("");
    setFileData(file); // ⭐ overwrite if reselected
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!section) {
      setErrors("Please select a section.");
      return;
    }

    if (!fileData) {
      setErrors("Please upload one image.");
      return;
    }

    const formData = new FormData();
    formData.append("section", section);
    formData.append("images[]", fileData);
    formData.append("names[]", fileData.name);

    try {
      const res = await fetch(
        "https://www.agathiyarpyramid.org/api/upload-home-gallery-images",
        { method: "POST", body: formData },
      );

      if (res.ok) {
        alert("Image uploaded successfully");
        setFileData(null);
        fileInputRef.current.value = "";
        fetchGalleryImages(section);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    await fetch(
      `https://www.agathiyarpyramid.org/api/delete-home-gallery-image/${id}`,
      { method: "DELETE" },
    );

    setGalleryImage(null);
  };

  /* ================= UI ================= */
  return (
    <div className="imageupload-container">
      <MenuBar />

      <h2 className="upload-image-text">Upload Home Images</h2>

      <form onSubmit={handleSubmit}>
        {/* SECTION (MANDATORY) */}
        <select
          className="input-field"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="">-- Select Section --</option>
          {SECTIONS.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* IMAGE (MANDATORY, SINGLE) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />

        {fileData && (
          <p>
            <strong>Selected Image:</strong> {fileData.name}
          </p>
        )}

        {errors && <p className="error-text1">{errors}</p>}

        <button type="submit" className="upload-btn">
          Submit
        </button>
      </form>

      {/* ================= GALLERY ================= */}
      <div className="gallery-list-container">
        <h2>{section || "Section"} Image</h2>

        {!galleryImage ? (
          <p className="empty-text">No image uploaded.</p>
        ) : (
          <div className="gallery-item">
            <img
              src={`https://www.agathiyarpyramid.org/${galleryImage.filepath.replace(
                "./",
                "",
              )}`}
              alt={galleryImage.name}
              loading="lazy"
            />

            <div className="gallery-info">
              <p>{galleryImage.filename}</p>

              <button
                className="delete-btn2"
                onClick={() => handleDeleteImage(galleryImage.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeImageUpload;
