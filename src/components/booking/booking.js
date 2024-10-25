import React, { useState, useEffect, useRef } from "react";
import Footer from "../Footer";
import "./booking.css";
import MenuBar from "../menumain/menubar";
import SearchBar from "./Search/Searchbar";
import BookingContent from "./bookingContent/bookingContent";
import axios from 'axios';

const Booking = () => {
  const [searchData, setSearchData] = useState({
    destination: "",
    checkInDate: null,
    checkOutDate: null,
    noOfDays: null,
  });
  const [showContent, setShowContent] = useState(false);
  const initCalled = useRef(false);

  const handleSearch = (data) => {
    setSearchData(data);
    setShowContent(true);
  };

  useEffect(()=> {
    if (!initCalled.current) {
      initRoomBooking();
      initCalled.current = true;
    }
  }, [])

  const initRoomBooking = async () => {
    const requestBody = {};
    try {
      const response = await axios.post(
        "https://agathiyarpyramid.org/api/init",
        requestBody
      );
      console.log("Booking initialized:", response.data);
    } catch (error) {
      console.error("Error initializing booking", error);
    }
  };

  return (
    <div className="outer-containers">
      <MenuBar />
      <div>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div>
        {showContent ? (
          <BookingContent data={searchData} />
        ) : (
          <div className="empty-content">No Search Results</div>
        )}
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Booking;
