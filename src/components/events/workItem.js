import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./workItem.css";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const WorkshopItem = ({
  mastername,
  eventname,
  retreatcost,
  eventdescription,
  startdate,
  enddate,
  numberofdays,
  place,
  imageurl,
  roomtype,
  contactdetails,
  language,
  eventid
}) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const handleRegister = (id) => {
    const isLoggedIn = sessionStorage.getItem("userDetails");
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
     const queryParams = new URLSearchParams();

    if (startdate) queryParams.append("startdate", startdate);
    if (enddate) queryParams.append("enddate", enddate);
    if (eventname) queryParams.append("eventname", eventname);
    if (mastername) queryParams.append("eventmastername", mastername);
    if (numberofdays) queryParams.append("eventdays", numberofdays);
    if (place) queryParams.append("eventplace", place);
    if (contactdetails) queryParams.append("contact", contactdetails);

    navigate(`/eventregister/${id}?${queryParams.toString()}`);
  };

  const calculateTimeLeft = (date) => {
    const currentDate = new Date();
    const eventDate = new Date(date);
    const timeDifference = eventDate - currentDate;

    if (timeDifference <= 0) return "Event started or past";

    const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${daysLeft} DAYS ${hoursLeft} HRS`;
  };

  const timeLeft = calculateTimeLeft(startdate);
  const descriptionSentences = eventdescription.split(". ").filter(Boolean);

  return (
    <div className="workshop-item">
      <div className="image-and-time">
        <div className="time-left">
          <span>CLOSES IN</span>
          <strong>{timeLeft}</strong>
        </div>
        <div className="image-placeholder" onClick={() => setShowImagePreview(true)}>
          <img className="event-image" src={imageurl} alt="event" />
          <div className="image-overlay"></div>
        </div>
        <div className="workshop-host-container">
          <p className="workshop-host">
            <span className="master-name">{mastername}</span>
            <span className="event-name-subtitle">{eventname}</span>
          </p>
        </div>
        <div className="workshop-info">
          <div className="register-button">
            <button className="btn-register" onClick={() => handleRegister(eventid)}>
              <span className="register-text">Register</span>
              <div className="button-shine"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="workshop-details">
        <div className="workshop-header">
          <h2 className="event-title">{eventname}</h2>
          <span className="price">₹ {retreatcost}</span>
        </div>

        <div className="description-container">
          {descriptionSentences.map((sentence, index) => (
            <div key={index} className="description-item">
              <p className="description">{sentence}.</p>
            </div>
          ))}
        </div>

        <div className="workshop-info-grid">
          <Box className="info-item" display="flex" alignItems="center">
            <div className="icon-wrapper">
              <CalendarTodayIcon style={{ fontSize: "30px" }} />
            </div>
            <Typography variant="body1" className="text-item">
              <b>Start Date</b><br /> {startdate}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <div className="icon-wrapper">
              <CalendarTodayIcon style={{ fontSize: "30px" }} />
            </div>
            <Typography variant="body1" className="text-item">
              <b>End Date</b><br /> {enddate}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <div className="icon-wrapper">
              <AccessTimeIcon style={{ fontSize: "30px" }} />
            </div>
            <Typography variant="body1" className="text-item">
              <b>Duration</b><br /> {numberofdays} day(s)
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <div className="icon-wrapper">
              <PlaceIcon style={{ fontSize: "30px" }} />
            </div>
            <Typography variant="body1" className="text-item">
              <b>Place</b><br /> {place || "Not specified"}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <div className="icon-wrapper">
              <PhoneIcon style={{ fontSize: "30px" }} />
            </div>
            <Typography variant="body1" className="text-item">
              <b>Contact</b><br /> {contactdetails}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <div className="icon-wrapper">
              <LanguageIcon style={{ fontSize: "35px" }} />
            </div>
            <Typography variant="body1" className="text-item">
              <b>Language</b><br /> {language || "Not specified"}
            </Typography>
          </Box>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Please Login</h2>
            </div>
            <div className="modal-body">
              <p>You need to log in to proceed with booking.</p>
            </div>
            <div className="modal-footer">
              <div className="modal-buttons">
                <button className="gotologin" onClick={() => navigate("/login")}>Go to Login</button>
                <button className="cancel-btn" onClick={() => setShowLoginModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="modal-overlay" onClick={() => setShowImagePreview(false)}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <CloseIcon
              className="close-icon"
              onClick={() => setShowImagePreview(false)}
            />
            <div className="preview-image-container">
              <img src={imageurl} alt="Preview" className="preview-image" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopItem;