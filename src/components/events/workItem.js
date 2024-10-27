import React from "react";
import { useNavigate } from "react-router-dom";
import "./workItem.css";
import PhoneIcon from "@mui/icons-material/Phone";
import BedIcon from "@mui/icons-material/Bed";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Typography } from "@mui/material";

const WorkshopItem = ({
  mastername,
  eventname,
  retreatcost,
  eventdescription,
  startdate,
  numberofdays,
  language,
  imageurl,
  roomtype,
  contactdetails,
  eventid
}) => {
  const navigate = useNavigate();

  const handleRegister = (id) => {
    navigate(`/eventregister/${id}`);
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
              <br /> {numberofdays}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <LanguageIcon style={{ fontSize: "35px", marginRight: "8px" }} />
            <Typography variant="body1" className="text-item">
              <b>Language</b>
              <br /> {language}
            </Typography>
          </Box>
          <Box className="info-item" display="flex" alignItems="center">
            <BedIcon style={{ fontSize: "35px", marginRight: "8px" }} />
            <Typography variant="body1" className="text-item">
              <b>Available Room</b>
              <br /> {roomtype}
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
    </div>
  );
};

export default WorkshopItem;
