import React from 'react';
import './MeditationInfo.css'; // Create this file for custom styles
const MeditationInfo = () => {
  return (
    <div className="meditation-info-container">
      <h2 className='meditation-heading'>What is Meditation</h2>
      <p style={{fontFamily: 'Raleway, sans-serif'}}>
        Meditation means making our mind 'rather empty'.
      </p>
      <p style={{fontFamily: 'Raleway, sans-serif'}}>
        Once our mind is more or less empty, we have a tremendous capability of receiving cosmic energy and cosmic information surrounding us.
      </p>
      <p style={{fontFamily: 'Raleway, sans-serif'}}>
        This leads to good health and absolute clarity in thought processes, leading to a joyous life.
      </p>
      <h3 style={{fontFamily: 'Raleway, sans-serif'}}>Key Benefits of Meditation:</h3>
      <ul className="benefit-list">
        <li>Tremendous capability of receiving cosmic energy and information.</li>
        <li>Promotes good health.</li>
        <li>Enhances clarity in thought processes.</li>
        <li>Leads to a joyous life.</li>
      </ul>
    </div>
  );
};
export default MeditationInfo;