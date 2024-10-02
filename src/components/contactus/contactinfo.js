import React from "react";
import "./contactinfo.css"; // Ensure this file contains the necessary styles
import MenuBar from "../menumain/menubar";
import Footer from "../Footer";

const contactInfo = () => {
  return (
    <div className="outer-container-contact">
        <MenuBar/>
      <div className="grid-container-contact">
        <div className="text-container-contact">
          <h2>Address</h2>
          <p>
            📍 <strong>Address:</strong>
            <br />
            Agasthiyar Pyramid Dhyana Ashram
            <br />
            Near Ramanaickenpettai,
            <br />
            Vaniyambadi,
            <br />
            Tirupathur District,
            <br />
            Tamilnadu, 635801
          </p>
        </div>
        <div className="text-container-contact">
          <h2>Contact</h2>
          <p>
            📞 <strong>Phone:</strong>   91 - 85250 44990
          </p>
          <p>
            🌐 <strong>Website:</strong>{" "}
            <a
              href="http://agathiyarpyramid.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              agathiyarpyramid.com
            </a>
          </p>
        </div>
        <div className="text-container-contact">
          <h2>Opening Hours</h2>
          <p>
            Mon - Fri: 8:00 am – 8:00 pm
            <br />
            Saturday:  9:00 am – 7:00 pm
            <br />
            Sunday:    9:00 am – 9:00 pm
          </p>
        </div>
      </div>
      <div className="grid-container-route">
      <div className="text-container-route">
        <h2>How to Reach the Ashram</h2>
        <h4>From Chennai Airport (MAA) to Ashram (207 KM)</h4>
        <p>
          📍 <strong>Train Route:</strong>
          <br />
          1. Airport to MGR Central (MAS) railway station - through Metro or Cab or Bus
          <br />
          2. MGR Central railway station (MAS) to Jolarpet (JTJ) or Vaniyambadi (VN) station - through train
          <br />
          3. Jolarpet (JTJ) or Vaniyambadi (VN) station to Ashram - Through Auto/Taxi
        </p>
      </div>
      <hr /> {/* Line between sections */}
      <div className="text-container-route">
        <p>
          📍 <strong>Bus Route:</strong>
          <br />
          1. Airport to Koyambedu Bus Station - through Metro or Cab or Bus
          <br />
          2. Koyambedu Bus Station - take Krishnagiri or Hosur or Bangalore bus - get down at Vaniyambadi Toll Gate
          <br />
          3. Vaniyambadi Toll Gate to Ashram - Through Auto/Taxi
        </p>
      </div>
      <hr /> {/* Line between sections */}
      <div className="text-container-route">
        <h4>From Bangalore Airport (BLR) to Ashram (160 KM)</h4>
        <p>
          📍 <strong>Train Route:</strong>
          <br />
          1. Airport to KSR Railway Station (SBC) - through Cab or Bus
          <br />
          2. KSR Railway Station (SBC) to Jolarpet (JTJ) or Vaniyambadi (VN) - through train
          <br />
          3. Jolarpet (JTJ) or Vaniyambadi (VN) station to Ashram - Through Auto/Taxi
        </p>
      </div>
      <hr /> {/* Line between sections */}
      <div className="text-container-route">
        <p>
          📍 <strong>Bus Route:</strong>
          <br />
          1. Airport to Santhi Nagar Bus Station - through Cab or Bus
          <br />
          2. Santhi Nagar Bus Station - take Vellore or Chennai bus - get down at Vaniyambadi Toll Gate
          <br />
          3. Vaniyambadi Toll Gate to Ashram - Through Auto/Taxi
        </p>
      </div>
    </div>
    {/* Google Map Embed */}
    <div className="map-container">
        <h2>Agasthiyar Pyramid Dhyana Ashram Map Location</h2>
        <iframe
          title="Agasthiyar Pyramid Dhyana Ashram Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3171.992320171554!2d78.56666131503957!3d12.51049279087976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3badac2a9cfcf1f1%3A0xe2f41c3e99d1f77c!2sAgasthiyar%20Pyramid%20Dhyana%20Ashram!5e0!3m2!1sen!2sin!4v1632925147838!5m2!1sen!2sin"
          width="800" // Increased width
          height="600" // Increased height
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
       
        {/* Directions Link */}
        <p>
          📍 <strong>Get Directions:</strong>{" "}
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=MG7G+G3H,%20Ramanaikenpet%20Road,%20Ambalur,%20Tamil%20Nadu%20635801,%20India"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here for directions
          </a>
        </p>
      </div>
      <Footer/>
    </div>
  );
};

export default contactInfo;