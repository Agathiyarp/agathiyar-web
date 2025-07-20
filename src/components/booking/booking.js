import React, { useState, useEffect } from "react";
import Footer from "../Footer";
import "./booking.css";
import MenuBar from "../menumain/menubar";
import BookingContent from "./bookingContent/bookingContent";
import axios from "axios";

const Booking = () => {
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://agathiyarpyramid.org/api/getBookingRecords`,
        {
          params: { date },
        }
      );
      if (response?.data) {
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

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="outer-containers">
      <MenuBar />
      <div className="booking-content-wrapper">
        <h1 className="booking-title">Agathiyar Pyramid Accomodation</h1>
        <h3 className="booking-subtitle">
          Destination: Agathiyar - Pathriji - Dormitory
        </h3>
        <div className="info-section-booking">
          <p>
            *We provide 3 types of rooms. Please select the respective stay
            based on the number of persons accommodating:
          </p>
          <ul className="tick-list">
            <li>Pathriji Bhavan - for a maximum accommodation of 4 personnel.</li>
            <li>Agathiyar Bhavan - for a maximum accommodation of 1 personnel.</li>
          </ul>
        </div>
        <div className="date-filter">
          <label htmlFor="booking-date" style={{ fontSize: "16px" }}>
            Select Date:
          </label>
          <input
            type="date"
            id="booking-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="loading-content">Loading...</div>
        ) : searchResult.length > 0 ? (
          <BookingContent searchResult={searchResult} />
        ) : (
          <div className="empty-content">No Rooms Available</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Booking;