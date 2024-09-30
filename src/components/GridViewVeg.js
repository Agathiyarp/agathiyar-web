import React from 'react';
import './GridViewVeg.css';
import vegetarian from '../images/vegetarian.png'; 
const GridViewVeg = () => {
  const vegetarianText = `
    Being a Vegetarian
    Vegetarianism is a conscious effort, a deliberate effort to get out of the heaviness 
    that keeps you tethered to the Earth so that you can fly. 
    So that the flight from the alone to the alone becomes possible.
  `;
  return (
    <div className="outer-container">
      <div className="grid-container">
        <div className="text-container">
          <h3>Being a Vegetarian</h3>
          <p>{vegetarianText}</p>
        </div>
        <div className="image-container">
          <div className="photo-frame">
            <img className="image" src={vegetarian} alt="vegetarian" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default GridViewVeg;