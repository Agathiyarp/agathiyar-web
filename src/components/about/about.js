import React from 'react';
import './about.css';
import MenuBar from '../menumain/menubar';
import Activity from '../../images/ActivityImage.png'; // Update with your image path
import Footer from '../Footer';

const About = () => {
  const spiritualPoints = [
    "Meditation Guidance for all visitors",
    "Monthly Full-moon & New-moon Meditation programs",
    "Weekend Spiritual Science workshops",
    "Intense Silence & Self-mastery Retreats",
    "Silence & Mindfulness training programs",
    "Anna Prasadam for all visitors"
  ];

  return (
    <div className="outer-containers">
      <MenuBar/>
      <div className="grid-containers">
        <div className="image-containers">
          <div className="photo-frames">
            <img className="image" src={Activity} alt="Swadhyayam" />
          </div>
        </div>
        <div className="text-containers">
          <h3 >Activities of Agathiyar Ashram</h3>
          <ul>
            {spiritualPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
      <div><Footer/></div>
    </div>
  );
};

export default About;