import React from "react";
import "./contactinfo.css";
import MenuBar from "../menumain/menubar";
import Footer from "../footer/Footer";

const ContactInfo = () => {
  return (
    <div className="outer-container-contact">
      <MenuBar />

      {/* Contact Details */}
      <div className="grid-container-contact">
        <div className="text-container-contact">
          <h2>Address</h2>
          <p>
            📍<strong>{" "}</strong>
            Agathiyar Pyramid Dhyana Ashram
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
          <p className="icon-text">
            📞 <strong>{" "}</strong> +91 - 8525044990
          </p>
          <p className="icon-text">
            🌐 <strong>{" "}</strong>
            <a
              href="http://agathiyarpyramid.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              agathiyarpyramid.org
            </a>
          </p>
        </div>

        <div className="text-container-contact">
          <h2>Opening Hours</h2>
          <p>
            Monday - Friday : 9:00 AM – 6:00 PM
            <br />
            Saturday : 9:00 AM – 7:00 PM
            <br />
            Sunday : 9:00 AM – 9:00 PM
          </p>
        </div>
      </div>

      {/* Routes */}
      <div className="grid-container-route">
        <div className="text-container-route">
          <h2>How to Reach the Ashram</h2>
          <h4>From Chennai Airport (MAA) to Ashram (207 KM)</h4>
          <p>
            📍 <strong>Train Route:</strong>
            <br />
            1. Airport to MGR Central (MAS) railway station - via Metro/Cab/Bus
            <br />
            2. MAS to Jolarpet (JTJ) or Vaniyambadi (VN) - by train
            <br />
            3. JTJ or VN to Ashram - via Auto/Taxi
          </p>
        </div>

        <hr />

        <div className="text-container-route">
          <p>
            📍 <strong>Bus Route:</strong>
            <br />
            1. Airport to Koyambedu Bus Station - via Metro/Cab/Bus
            <br />
            2. Take Krishnagiri/Hosur/Bangalore bus - get down at Vaniyambadi Toll Gate
            <br />
            3. Toll Gate to Ashram - via Auto/Taxi
          </p>
        </div>

        <hr />

        <div className="text-container-route">
          <h4>From Bangalore Airport (BLR) to Ashram (160 KM)</h4>
          <p>
            📍 <strong>Train Route:</strong>
            <br />
            1. Airport to KSR Railway Station (SBC) - via Cab/Bus
            <br />
            2. SBC to Jolarpet (JTJ) or Vaniyambadi (VN) - by train
            <br />
            3. JTJ or VN to Ashram - via Auto/Taxi
          </p>
        </div>

        <hr />

        <div className="text-container-route">
          <p>
            📍 <strong>Bus Route:</strong>
            <br />
            1. Airport to Santhi Nagar Bus Station - via Cab/Bus
            <br />
            2. Take Vellore/Chennai bus - get down at Vaniyambadi Toll Gate
            <br />
            3. Toll Gate to Ashram - via Auto/Taxi
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="map-container">
        <h2>Agathiyar Pyramid Dhyana Ashram Map Location</h2>
        <iframe
          title="Agathiyar Pyramid Dhyana Ashram Map"
          src="https://www.google.com/maps?q=12.664172985906085,78.52528975280582&z=17&output=embed"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <p>
          📍 <strong>Get Directions:</strong>{" "}
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=12.664172985906085,78.52528975280582"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here for directions
          </a>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default ContactInfo;