import React, { useState, useEffect } from "react";
import Footer from "../Footer";
import "./booking.css";
import MenuBar from "../menumain/menubar";
import BookingContent from "./bookingContent/bookingContent";
import axios from "axios";

const Booking = () => {
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://agathiyarpyramid.org/api/getBookingRecords"
        );
        if (response && response?.data) {
          setSearchResult(response.data);
        } else {
          setSearchResult([]);
        }
      } catch (error) {
        console.error("Error loading booking data", error);
        setSearchResult([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="outer-containers">
      <MenuBar />
      <div>
        <h1 className="booking-title">Agathiyar Pyramid Accomodation</h1>
        <h3 className="booking-subtitle">Destination: Agathiyar - Pathiriji - Dormitory</h3>
        <div className="info-section-booking">
          <p>*We provide 3 types of rooms. Please select the respective stay based on the number of persons accommodating:</p>
          <ul>
            <li>Pathriji Bhavan - for a maximum accommodation of 4 personnel.</li>
            <li>Agathiyar Bhavan - for a maximum accommodation of 1 personnel.</li>
          </ul>
        </div>
        {loading ? (
          <div className="loading-content">Loading...</div>
        ) : searchResult.length > 0 ? (
          <BookingContent searchResult={searchResult} />
        ) : (
          <div className="empty-content">No Rooms Available</div>
        )}
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Booking;
