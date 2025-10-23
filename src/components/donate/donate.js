import React from "react";
import MenuBar from "../menumain/menubar";
import Footer from '../footer/Footer';
import ScanImage from "../../images/scan.png";
import './donate.css';

const Donate = () => {
  const spiritualPoints = [
    "When you do your Dharma, your own Dharma protects you",
    "Kindly do your Dharma to support Anna Prasadam & Maintenance of this Mouna Dhyana Ashram",
  ];

  return (
    <div className="outer-containers">
      <MenuBar />
      <div className="grid-containers">
        <div className="text-containers-donate">
          <h2>“Dharmo Rakshathi Rakshitaha”</h2>
          <ul>
            {spiritualPoints.map((point, index) => (
              <li className="spirtual-list" key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid-container">
        <div className="donate-image-container">
          <div className="photo-frame">
            <img className="image" src={ScanImage} alt="ScanImage" />
          </div>
        </div>
        <div className="donate-container">
          <h2 >Donate</h2>

          <h4 >Pay Via QR code / Trust Account Details</h4>
          <p >
            The Chennai Pyramid Spiritual Trust
            <br />
            Bank of Baroda, SB ACC.No: 69760100000309
            <br />
            IFSC Code: BARB0VJRAPE (5th digit is zero)
          </p>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Donate;