import React from 'react';
import './MeditationInfo.css'; // Ensure the styles below are in this file
import meditationImg from '../images/home/meditation3.png';

const MeditationInfo = () => {
  return (
    <div className="meditation-section">
      <div className="meditation-left">
        <h1 className="meditation-title">What is Meditation?</h1>
        <p>
          Meditation means making our mind 'rather empty'. Once our mind is more or less empty, we have a tremendous capability of receiving cosmic energy and cosmic information surrounding us. This leads to good health and absolute clarity in thought processes, leading to a joyous life.
        </p>
      </div>

      <div className="meditation-right">
        <img src={meditationImg} alt="Meditation" className="meditation-image" />
      </div>
    </div>
  );
};

export default MeditationInfo;