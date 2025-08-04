import React from 'react';
import './GridViewAgath.css';
import swathayayam from '../images/swathayayam.png'; // Update with your image path
const GridViewAgath = () => {
    const spiritualText1 = 'Reading Spiritual Books';
    const spiritualText2 = `
      The more we understand our ‘Self’, the more we read spiritual books.
      A student of spirituality must read all the books of all spiritual masters.
      Reading spiritual books hastens our spiritual progress.
    `;
  
    return (
      <div className="outer-container">
        <h1 className="meditation-heading">Swadhyayam</h1>
        <div className="grid-container">
          <div className="image-container">
            <div className="photo-frame">
              <img className="image" src={swathayayam} alt="Swathayayam" />
            </div>
          </div>
          <div className="text-container">
            <h3 style={{marginBottom: "10px"}}>{spiritualText1}</h3>
            <p>{spiritualText2}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default GridViewAgath;