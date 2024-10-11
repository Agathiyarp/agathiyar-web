import React from 'react';
import './App.css'; // Custom CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/home';
import About from './components/about/about';
import AppRegistration from './components/register/register';
import Login from './components/login/login';
import Contact from './components/contactus/contactinfo';
import Donate from './components/donate/donate';
import Book from './components/book/book';
import Booking from './components/booking/booking';
const App = () => {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/registration" element={<AppRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/book" element={<Book />} />
          <Route path="/booking" element={<Booking />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;