import React from 'react';
import './GridViewAgath.css';
import swathayayam from '../images/swathayayam.png'; // Update with your image path
const GridViewAgath = () => {
    const spiritualText = `
      Swadhyayam
      Reading Spiritual Books
  
      The more we understand our ‘Self’, the more we read spiritual books.
      A student of spirituality must read all the books of all spiritual masters.
      Reading spiritual books hastens our spiritual progress.
    `;
  
    return (
      <div className="outer-container">
        <div className="grid-container">
          <div className="image-container">
            <div className="photo-frame">
              <img className="image" src={swathayayam} alt="Swathayayam" />
            </div>
          </div>
          <div className="text-container">
            <p>{spiritualText}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default GridViewAgath;