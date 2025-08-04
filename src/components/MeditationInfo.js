import React from 'react';
import './MeditationInfo.css'; // Create this file for custom styles

import meditationImg from '../images/rooms/Gallery/5.png';

const MeditationInfo = () => {
  return (
    <div className="outer-container">
      <div className="grid-container">
        <div className="text-container-meditation">
          <div className="meditation-info-container">
            <p>Meditation means making our mind 'rather empty'.</p>
            <p>
              Once our mind is more or less empty, we have a tremendous capability of receiving cosmic energy and cosmic information surrounding us.
            </p>
            <p>
              This leads to good health and absolute clarity in thought processes, leading to a joyous life.
            </p>
            <h3 style={{ marginBottom: "10px" }}>Key Benefits of Meditation:</h3>
            <ul className="benefit-list">
              <li>Tremendous capability of receiving cosmic energy and information.</li>
              <li>Promotes good health.</li>
              <li>Enhances clarity in thought processes.</li>
              <li>Leads to a joyous life.</li>
            </ul>
          </div>
        </div>
        <div className="border"></div>
        <div className="image-container">
          <div className="photo-frame">
            <img className="image" src={meditationImg} alt="Meditation" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default MeditationInfo;