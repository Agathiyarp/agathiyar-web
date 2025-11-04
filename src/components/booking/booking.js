import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from '../footer/Footer';
import "./booking.css";
import MenuBar from "../menumain/menubar";
import BookingContent from "./bookingContent/bookingContent";
import axios from "axios";

const Booking = () => {
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [selectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [enabledDateRanges, setEnabledDateRanges] = useState([]);
  const userStr = sessionStorage.getItem("userDetails");
  const userDetails = userStr ? JSON.parse(userStr) : null;
  const userType = userDetails?.usertype?.trim().toLowerCase() || "";
  const location = useLocation();   

  useEffect(() => {
    if (userDetails) {
      setAvailableCredits(userDetails.credits || 0);
    }
  }, [userDetails]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    refreshUserCredits();
  }, []);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      refreshUserCredits();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get("https://www.agathiyarpyramid.org/api/getschedules");
      const schedules = response?.data || [];

      const enabledRanges = schedules
        .filter(s => s.enable?.toLowerCase() === "yes")
        .map(s => ({
          startDate: s.startDate,
          endDate: s.endDate,
        }));

      setEnabledDateRanges(enabledRanges);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const refreshUserCredits = async () => {
    try {
      if (!userDetails?.usermemberid) return;

      const response = await axios.get("https://www.agathiyarpyramid.org/api/users");
      const users = response?.data || [];

      const matchedUser = users.find(u => u.usermemberid === userDetails.usermemberid);
      if (matchedUser) {
        setAvailableCredits(matchedUser.credits || 0);

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
        { params: { date } }
      );
      setSearchResult(response?.data || []);
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

  // Check if selectedDate is inside any restricted enabled date range
 const isDateBlocked = enabledDateRanges.length > 0;


  return (
    <div className="outer-containers">
      <MenuBar />
      <div className="booking-content-wrapper">
        <h1 className="booking-title">Agathiyar Pyramid Accommodation</h1>
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

        {isDateBlocked && (
          <div className="custom-date-warning">
            ⚠️ Booking is currently blocked and not available for the selected date ranges
            <br />
            Blocked Dates:
            <ul>
              {enabledDateRanges.map((range, idx) => (
                <li key={idx}>
                  {range.startDate} to {range.endDate}
                </li>
              ))}
            </ul>
          </div>
        )}

        {userType && userType !== "user" && (
          <div className="available-credits">
            Available User Credits: <span className="credit-value">{availableCredits}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-content">Loading...</div>
        ) : searchResult.length > 0 ? (
          <BookingContent
            searchResult={searchResult}
            refreshUserCredits={refreshUserCredits}
            enabledDateRanges={enabledDateRanges}
          />
        ) : (
          <div className="empty-content">No Rooms Available</div>
        )}
      </div>

      <div className="info-strip-booking">
        <p><strong>Terms and Conditions:</strong></p>
        <ul className="tick-list">
          <li>Example: If a user books&nbsp; 2 days and 2 rooms, <strong>&nbsp;credit will be reduced by 4</strong>.</li>
          <li>Example: If a user books&nbsp; 1 day and 1 room, <strong>&nbsp;credit will be reduced by 1</strong>.</li>
          <li>Rule 1: A maximum of 2 rooms can be booked per person.</li>
          <li>Rule 2: A booking can be made for a maximum of 10 days.</li>
          <li>Rule 3: A maintenance fee of ₹300 is applicable per booking, regardless of room type or duration.</li>
          <li>Rule 4: Extra bed is allowed only in the Patriji room.</li>
          <li>Rule 5: Only one extra bed is allowed per Patriji room.</li>
          <li>Rule 6: The extra bed cost is ₹300 per bed per day.</li>
          <li>Rule 7: The Patriji room costs ₹2000 per day.</li>
          <li>Rule 8: The Agathiyar room costs ₹1000 per day.</li>
          <li>Rule 9: The Dormitory costs ₹500 per day.</li>
          <li>Rule 10: Donor members receive 10 credits.</li>
          <li>Rule 11: Sponsor members receive 30 credits.</li>
          <li>Rule 12: patron members receive 60 credits.</li>
          <li>Rule 13: Donors can book only Agathiyar and Dormitory rooms. They cannot book the Patriji room.</li>
          <li>Rule 14: Sponsors can book Patriji, Agathiyar, and Dormitory rooms.</li>
          <li>Rule 15: patrons can book Patriji, Agathiyar, and Dormitory rooms.</li>
          <li>Rule 16: Extra bed is not allowed in Agathiyar and Dormitory rooms.</li>
          <li>Rule 17: Ensure that your credit balance is sufficient for the type of room and number of days before booking.</li>
          <li>Rule 18: All bookings are subject to availability.</li>
          <li>Rule 19: Maintenance cost and extra bed cost (if applicable) are charged in addition to room pricing.</li>
          <li>Rule 20: You have to sign out and sign in to see your updated user type and booking credits updates.</li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;