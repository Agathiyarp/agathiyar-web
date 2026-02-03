import React, { useEffect, useState } from "react";
import "./events.css";
import MenuBar from "../menumain/menubar";
import Footer from "../footer/Footer";
import WorkshopItem from "./workItem";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

const UpcomingWorkshops = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const getEvents = async () => {
    try {
      const response = await axios.get(
        "https://agathiyarpyramid.org/api/get-events"
      );
      setEventData(response.data || []);
      console.log("Events loaded successfully:", response.data);
    } catch (error) {
      console.error("Error loading events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <div className="workshop-page">
      <MenuBar />
      <div className="workshop-list">
        {loading ? (
          <p className="event-status-message">Loading events...</p>
        ) : eventData.length === 0 ? (
          <div className="no-events-container">
            <p className="event-status-message">No Events found.</p>
          </div>
        ) : (
          eventData.map((data, index) => (
            <WorkshopItem
              key={index}
              {...data}
              onImageClick={setPreviewImage}
              onLoginRequired={() => setShowLoginModal(true)}
            />
          ))
        )}
      </div>
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div
            className="modal-content preview-modal"
            style={{ marginTop: "100px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseIcon
              className="close-icon"
              onClick={() => setPreviewImage(null)}
            />
            <div className="preview-image-container">
              <img src={previewImage} alt="Preview" className="preview-image" />
            </div>
          </div>
        </div>
      )}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div
            className="modal-content login-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Please Login</h2>
            </div>
            <div className="modal-body">
              <p>You need to log in to proceed with booking.</p>
            </div>
            <div className="modal-footer">
              <button className="gotologin" onClick={() => navigate("/login")}>
                Go to Login
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UpcomingWorkshops;
