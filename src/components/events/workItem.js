import React from 'react';
import { useNavigate } from "react-router-dom";
import './workItem.css';

const WorkshopItem = ({
  hostName,
  hostTitle,
  workshopTitle,
  price,
  description,
  timeLeft,
  startDate,
  duration,
  language,
  eventImage,
}) => {
  
  const navigate = useNavigate();
  const handleRegister = ()=> {
    navigate("/eventregister"); 
  }
  return (
    <div className="workshop-item">
      <div className="image-and-time">
        <div className="time-left">
          <span>CLOSES IN</span>
          <strong>{timeLeft}</strong>
        </div>
        <div className="image-placeholder">
          <img class="event-image" src={eventImage} alt="event-image"/>
        </div>
        <p className="workshop-host">
          {hostName} <br /> {hostTitle}
        </p>
      </div>

      <div className="workshop-details">
        <div className="workshop-header">
          <h2 className="event-title">{workshopTitle}</h2>
          <span className="price">₹ {price}</span>
        </div>
        <p className="description">{description}</p>

        <div className="workshop-info">
          <div className="info-item">
            <i style={{ fontSize: '35px' }} className="icon-calendar"></i>
            <span className="text-item"><b>Start Date</b><br/> {startDate}</span>
          </div>
          <div className="info-item">
            <i style={{ fontSize: '35px' }} className="icon-clock"></i>
            <span className="text-item"><b>Duration</b><br/> {duration}</span>
          </div>
          <div className="info-item">
            <i style={{ fontSize: '35px' }} className="icon-language"></i>
            <span className="text-item"><b>Language</b><br/> {language}</span>
          </div>
        </div>

        <div className="register-button">
          <a className="btn-register" onClick={handleRegister}>Register</a>
        </div>
      </div>
    </div>
  );
};


export default WorkshopItem;
