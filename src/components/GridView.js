import React from 'react';
import './GridView.css';
import yourImage from '../images/image3.png';

const GridView = () => {
    const meditationGuide = [
      { title: "Right Posture, Sit Comfortably", steps: [
          "Clasp Your Hands",
          "Cross Your Legs",
          "Close Your Eyes"
        ]
      },
      { title: "Observe the Breath", steps: [
          "Witness Your Natural Breath",
          "Whenever thoughts arise, do not give any attention to your thoughts. Gently return to witnessing your natural breath."
        ]
      },
      { title: "Ending Meditation", steps: [
          "Unclasp Your Hands",
          "Place Your Fingers on Your Eyes for 5 Seconds",
          "Open Your Eyes"
        ]
      },
    ];
 
    return (
      <div className="outer-container">
        <div className="grid-container">
          <div className="text-container">
            {meditationGuide.map((section, index) => (
              <div key={index}>
                <h3 class='section-title'>{section.title}</h3>
                <ul className="bullet-points">
                  {section.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border"></div>
          <div className="image-container">
            <div className="photo-frame">
              <img className="image" src={yourImage} alt="Meditation" />
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  export default GridView;