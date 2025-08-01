import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./workItem.css";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from '@mui/icons-material/Place';
import { Box, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";

const WorkshopItem = ({
  mastername,
  eventname,
  retreatcost,
  eventdescription,
  startdate,
  enddate,
  numberofdays,
  destination,
  imageurl,
  roomtype,
  contactdetails,
  eventid
}) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleRegister = (id) => {
    const isLoggedIn = sessionStorage.getItem("userDetails");
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate(`/eventregister/${id}${startdate ? `?startdate=${startdate}` : ""}${enddate ? `&enddate=${enddate}` : ""}`);
  };

  const calculateTimeLeft = (date) => {
    const currentDate = new Date();
    const eventDate = new Date(date);
    const timeDifference = eventDate - currentDate;

    if (timeDifference <= 0) {
      return "Event started or past";
    }

    const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

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
        <div className="image-placeholder">
          <img className="event-image" src={imageurl} alt="event-image" />
        </div>
        <p className="workshop-host">
          {mastername} <br /> {eventname}
        </p>
        <div className="workshop-info">
          <div className="register-button">
            <button className="btn-register" onClick={()=>handleRegister(eventid)}>
              Register
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
            <p key={index} className="description">
              {sentence}.
            </p>
          ))}
        </div>

        <div className="workshop-info">
          <Box className="info-item" display="flex" alignItems="center">
            <CalendarTodayIcon style={{ fontSize: "35px", marginRight: "8px" }} />
            <Typography variant="body1" className="text-item">
              <b>Start Date</b>
              <br /> {startdate}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <AccessTimeIcon style={{ fontSize: "35px", marginRight: "8px" }} />
            <Typography variant="body1" className="text-item">
              <b>Duration</b>
              <br /> {numberofdays}{" day(s)"}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <PlaceIcon style={{ fontSize: "35px", marginRight: "8px"}} />
            <Typography variant="body1" className="text-item">
              <b>Place</b>
              <br /> {destination || "Not specified"}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <PhoneIcon style={{ fontSize: "35px", marginRight: "8px" }} />
            <Typography variant="body1" className="text-item">
              <b>Contact</b>
              <br /> {contactdetails}
            </Typography>
          </Box>
        </div>

        
      </div>
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Please Login</h2>
            <p>You need to log in to proceed with booking.</p>
            <div className="modal-buttons">
              <button className="gotologin" onClick={() => navigate("/login")}>Go to Login</button>
              <button className="cancel-btn" onClick={() => setShowLoginModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopItem;
