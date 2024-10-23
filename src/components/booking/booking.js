import React , { useState } from "react";
import Footer from "../Footer";
import './booking.css';
import MenuBar from "../menumain/menubar";
import SearchBar from "./Search/Searchbar";
import BookingContent from "./bookingContent/bookingContent";

const Booking = () => {

  const [searchData, setSearchData] = useState({
    destination: '',
    checkInDate: null,
    checkOutDate: null,
    noOfDays: null
  });
  const [showContent, setShowContent] = useState(false);

  const handleSearch = (data) => {
    setSearchData(data);
    setShowContent(true);
  };

  return (
    <div className="outer-containers">
      <MenuBar />
      <div>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div>
      {showContent ? <BookingContent data={searchData}/> : <div className="empty-content">
        No Search Results
      </div> }
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Booking;