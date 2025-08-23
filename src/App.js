import React from 'react';
import './App.css'; // Custom CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/home';
import AppRegistration from './components/register/register';
import Login from './components/login/login';
import Contact from './components/contactus/contactinfo';
import Donate from './components/donate/donate';
import Book from './components/book/book';
import Booking from './components/booking/booking';
import Events from './components/events/events';
import EventRegistrationForm from './components/eventregistration/eventregistration';
import VideoList from './components/videos/VideoList';
import RoomDetails from "./components/booking/bookingContent/roomDetails";
import ProfilePage from './components/menumain/Profilepage';
import AdminDashboard from './components/admin/admin';
import Users from './components/admin/users/users';
import AddEvent from './components/admin/events/addevent';
import AddBooking from './components/admin/booking/addbooking';
import Gallery from './components/gallery/gallery';
import UploadBooks from './components/admin/books/uploadbooks';
import UpdateUser from './components/admin/users/updateuser';
import VideoUpload from './components/admin/videos/videoupload'
import EventList from './components/admin/events/eventlist';
import RoomList from './components/admin/booking/roomlist';
import EventDetails from './components/admin/events/eventdetails';
import UserCredits from './components/admin/users/usercredits';
import BookingConfirmation from './components/admin/booking/bookingconfirmation';
import BlockRooms from './components/admin/booking/blockrooms';
import ImageUpload from './components/admin/images/imageupload';
import ManualBooking from './components/admin/manualbooking/manualbooking';
import DailyAvailability from './components/admin/dailyavailability/dailyavailability';

const App = () => {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<AppRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/book" element={<Book />} />
          <Route path="/events" element={<Events />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/eventregister/:eventId" element={<EventRegistrationForm />} />
          <Route path="/profileview" element={<ProfilePage />} />
          <Route path="/videos" element={<VideoList />} />
          <Route path="/room-details" element={<RoomDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/addevent" element={<AddEvent />} />
          <Route path="/addrooms" element={<AddBooking />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/uploadbook" element={<UploadBooks />} />
          <Route path="/updateuser" element={<UpdateUser />} />
          <Route path="/videoupload" element={<VideoUpload />}/>
          <Route path="/imageupload" element={<ImageUpload />}/>
          <Route path="/eventlist" element={<EventList />}/>
          <Route path="/roomlist" element={<RoomList />} />
          <Route path="/eventdetails" element={<EventDetails />} />
          <Route path="/bookingconfirmation" element={<BookingConfirmation />} />
          <Route path="/usercredits" element={<UserCredits />} />
          <Route path="/blockrooms" element={<BlockRooms />} />
           <Route path="/manualbooking" element={<ManualBooking />} />
           <Route path="/roomsavailability" element={<DailyAvailability />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;