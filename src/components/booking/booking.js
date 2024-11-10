import React, { useState } from "react";
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
  const [searchResult, setSearchResult] = useState([]);

  const getSeachResults = async (destination, checkInDate, checkOutDate) => {

    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00Z`; // RFC3339 format with UTC time
  };
  
    const formattedCheckInDate = formatDate(checkInDate);
    const formattedCheckOutDate = formatDate(checkOutDate);
    try {
      const response = await axios.get(
        "https://agathiyarpyramid.org/api/bookings/filter",
        {
          params: {
            destination: destination,
            startdate: formattedCheckInDate,
            enddate: formattedCheckOutDate,
          },
        }
      );
      if(response && response?.data){
        setSearchResult(response?.data);
      } else {
        setSearchResult([]);
      }
    } catch (error) {
      console.error("Error Filter Booking results", error);
    }
  };

  const handleSearch = (data) => {
    setSearchData(data);
    setShowContent(true);
    if(data) {
      getSeachResults(data?.destination, data?.checkInDate, data?.checkOutDate);
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
          <BookingContent data={searchData} searchResult={searchResult}/>
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
