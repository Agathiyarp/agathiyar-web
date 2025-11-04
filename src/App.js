import React from 'react';
import './App.css'; // Custom CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProtectedRoute, AdminProtectedRoute } from './components/auth/ProtectedRoute';
import { isAuthenticated } from './components/auth/authHelper';
import Home from './components/home/home';
import AppRegistration from './components/register/register';
import Login from './components/login/login';
import Contact from './components/contactus/contactinfo';
import Donate from './components/donate/donate';
import Book from './components/book/book';
import Booking from './components/booking/booking';
import Events from './components/events/events';
import VideoList from './components/videos/VideoList';
import RoomDetails from "./components/booking/bookingContent/roomDetails";
import Gallery from './components/gallery/gallery';

import ProfilePage from './components/menumain/Profilepage';
import EventRegistrationForm from './components/eventregistration/eventregistration';
import AdminDashboard from './components/admin/admin';
import Users from './components/admin/users/users';
import AddEvent from './components/admin/events/addevent';
import AddBooking from './components/admin/booking/addbooking';
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
import { Navigate } from 'react-router-dom';

/**
 * Special route for /login and /registration
 * If the user is ALREADY logged in, we redirect them to their profile
 * instead of showing the login page again.
 */
const PublicOnlyRoute = ({ element }) => {
  const isAuth = isAuthenticated();
  return isAuth ? <Navigate to="/profileview" replace /> : element;
};

const App = () => {

  return (
    <div>
      <Router>
        <Routes>
          {/* =================================
          === PUBLIC ROUTES (Everyone)  ===
          =================================
          */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/book" element={<Book />} />
          <Route path="/events" element={<Events />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/videos" element={<VideoList />} />
          <Route path="/room-details" element={<RoomDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          
          {/*
          --- Special Public Routes (Login/Register) ---
          Users who are already logged in shouldn't see these pages.
          */}
          <Route 
            path="/login" 
            element={<PublicOnlyRoute element={<Login />} />} 
          />
          <Route 
            path="/registration" 
            element={<PublicOnlyRoute element={<AppRegistration />} />} 
          />


          {/* =================================
          === USER PROTECTED ROUTES     ===
          =================================
          Only logged-in users (any type) can see these.
          */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/profileview" element={<ProfilePage />} />
            <Route path="/eventregister/:eventId" element={<EventRegistrationForm />} />
            {/* Add any other user-specific routes here */}
          </Route>


          {/* =================================
          === ADMIN PROTECTED ROUTES    ===
          =================================
          Only users with userrole === 'admin' or 'superadmin' can see these.
          */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/addevent" element={<AddEvent />} />
            <Route path="/addrooms" element={<AddBooking />} />
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
            {/* Add all other admin-only routes here */}
          </Route>
          <Route path="*" element={<div><h1>404 - Page Not Found</h1></div>} />

        </Routes>
      </Router>
    </div>
  );
};

export default App;