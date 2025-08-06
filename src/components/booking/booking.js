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

   const fetchBookingAvailability = async () => {
    const memberId = userDetails?.usermemberid;

    if (!memberId) return;

    try {
      const response = await axios.get(`https://agathiyarpyramid.org/api/getBookingAvailability/${memberId}`);
      console.log("Booking Availability:", response.data);
    } catch (error) {
      console.error("Error fetching booking availability:", error);
    }
  };


  useEffect(() => {
    fetchBookingAvailability();
  }, []);

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
          <li>If a user books&nbsp; 2 days and 2 rooms, <strong>&nbsp;credit will be reduced by 4</strong>.</li>
          <li>If a user books&nbsp; 1 day and 1 room, <strong>&nbsp;credit will be reduced by 1</strong>.</li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;