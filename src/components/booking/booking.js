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
  });

  const handleSearch = (data) => {
    setSearchData(data);
  };

  return (
    <div className="outer-containers">
      <MenuBar />
      <div>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div>
      <BookingContent data={searchData}/>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Booking;