import React from "react";
import Footer from "../Footer";
import './booking.css';
import MenuBar from "../menumain/menubar";
import SearchBar from "./Search/Searchbar";
import BookingList from './bookinglist/bookinglist';

const Booking = () => {

  return (
    <div className="outer-containers">
      <MenuBar />
      <div>
        <SearchBar />
      </div>
      <div>
      <BookingList />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Booking;