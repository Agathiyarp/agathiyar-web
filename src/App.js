import React from 'react';
import './App.css'; // Custom CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/home';
// import About from './components/about/about';
import AppRegistration from './components/register/register';
import Login from './components/login/login';
import Contact from './components/contactus/contactinfo';
import Donate from './components/donate/donate';
import Book from './components/book/book';
import Booking from './components/booking/booking';
import Events from './components/events/events';
import EventRegistrationForm from './components/eventregistration/eventregistration';
import MobileProfileMenu from './components/menumain/mobileProfileMenu';
import VideoList from './components/videos/VideoList';

const App = () => {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
          <Route path="/registration" element={<AppRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/book" element={<Book />} />
          <Route path="/events" element={<Events />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/eventregister" element={<EventRegistrationForm />} />
          <Route path="/profile" element={<MobileProfileMenu />} />
          <Route path="/videos" element={<VideoList />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;