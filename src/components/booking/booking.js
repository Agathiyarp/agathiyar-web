import React from "react";
import Footer from "../Footer";
import './booking.css';
import MenuBar from "../menumain/menubar";
import SearchBar from "./Search/Searchbar";
import BookingContent from "./bookingContent/bookingContent";

const Booking = () => {

  return (
    <div className="outer-containers">
      <MenuBar />
      <div>
        <SearchBar />
      </div>
      <div>
      <BookingContent />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Booking;