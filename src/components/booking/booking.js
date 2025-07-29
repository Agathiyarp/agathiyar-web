import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../Footer";
import "./booking.css";
import MenuBar from "../menumain/menubar";
import BookingContent from "./bookingContent/bookingContent";
import axios from "axios";

const Booking = () => {
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const userStr = sessionStorage.getItem("userDetails");
  const userDetails = userStr ? JSON.parse(userStr) : null;
  const userType = userDetails?.usertype?.trim().toLowerCase() || "";
  const location = useLocation(); 


  useEffect(() => {
    const userDetails = userStr ? JSON.parse(userStr) : null;
    if (userDetails) {
      setAvailableCredits(userDetails.credits || 0);
    }
  }, []);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      refreshUserCredits();
      // Clear the state to prevent repeated refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const refreshUserCredits = async () => {
    try {
      const userDetails = userStr ? JSON.parse(userStr) : null;
      if (!userDetails?.usermemberid) return;

      const response = await axios.get("https://www.agathiyarpyramid.org/api/users");
      const users = response?.data || [];

      const matchedUser = users.find(u => u.usermemberid === userDetails.usermemberid);
      if (matchedUser) {
        setAvailableCredits(matchedUser.credits || 0);

        // Update sessionStorage for consistency
        const updatedUserDetails = { ...userDetails, credits: matchedUser.credits };
        sessionStorage.setItem("userDetails", JSON.stringify(updatedUserDetails));
      }
    } catch (error) {
      console.error("Failed to refresh credits:", error);
    }
  };


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
          Destination: Agathiyar - Patriji - Dormitory
        </h3>
        <div className="info-section-booking">
          <p>
            *We provide 3 types of rooms. Please select the respective stay
            based on the number of persons accommodating:
          </p>
          <ul className="tick-list">
            <li>Patriji Bhavan - for a maximum accommodation of 4 personnel.</li>
            <li>Agathiyar Bhavan - for a maximum accommodation of 1 personnel.</li>
          </ul>
        </div>
        {/* <div className="date-filter">
          <label htmlFor="booking-date" style={{ fontSize: "16px" }}>
            Select Date:
          </label>
          <input
            type="date"
            id="booking-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div> */}
        {userType && userType !== "user" && (
          <div className="available-credits">
            Available User Credits: <span className="credit-value">{availableCredits}</span>
          </div>
        )}


        {loading ? (
          <div className="loading-content">Loading...</div>
        ) : searchResult.length > 0 ? (
          <BookingContent searchResult={searchResult}  refreshUserCredits={refreshUserCredits}/>
        ) : (
          <div className="empty-content">No Rooms Available</div>
        )}
      </div>
      <div className="info-strip-booking">
        <ul>
          <li><strong>Terms and Conditions:</strong></li>
          <li>✔️ If a user books&nbsp;<strong> 2 days and 2 rooms</strong>, <strong>&nbsp;credit will be reduced by 4</strong>.</li>
          <li>✔️ If a user books&nbsp;<strong> 1 day and 1 room</strong>, <strong>&nbsp;credit will be reduced by 1</strong>.</li>
        </ul>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;