import React from 'react';
import './GridViewAgath.css';
import yourImage from './images/your-image.jpg'; // Update with your image path
const GridView = () => {
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
              <img className="image" src={yourImage} alt="Spiritual Reading" />
            </div>
          </div>
          <div className="text-container">
            <h3>Swadhyayam</h3>
            <p>{spiritualText}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default GridView;