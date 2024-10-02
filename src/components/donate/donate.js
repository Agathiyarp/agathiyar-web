import React from "react";
import MenuBar from "../menumain/menubar";
import Footer from "../Footer";
import ScanImage from "../../images/scanimage.png";

const Donate = () => {
  const spiritualPoints = [
    "When you do your Dharma, your own Dharma protects you",
    "Kindly do your Dharma to support Anna Prasadam & Maintenance of this Mouna Dhyana Ashram",
  ];

  return (
    <div className="outer-containers">
      <MenuBar />
      <div className="grid-containers">
        <div className="text-containers">
          <h2>“ Dharmo Rakshathi Rakshitaha ”</h2>
          <ul>
            {spiritualPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid-container">
        <div className="image-container">
          <div className="photo-frame">
            <img className="image" src={ScanImage} alt="ScanImage" />
          </div>
        </div>
        <div className="text-container">
          <h2>Donate</h2>

          <h3>Pay Via QR code / Trust Account Details</h3>
          <p>
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