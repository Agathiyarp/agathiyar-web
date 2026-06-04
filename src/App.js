import React, { Suspense, lazy } from 'react';
import './App.css'; // Custom CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProtectedRoute, AdminProtectedRoute } from './components/auth/ProtectedRoute';
import { isAuthenticated } from './components/auth/authHelper';

// Lazy load components
const Home = lazy(() => import('./components/home/home'));
const AppRegistration = lazy(() => import('./components/register/register'));
const Login = lazy(() => import('./components/login/login'));
const Contact = lazy(() => import('./components/contactus/contactinfo'));
const Donate = lazy(() => import('./components/donate/donate'));
const Book = lazy(() => import('./components/book/book'));
const Booking = lazy(() => import('./components/booking/booking'));
const Events = lazy(() => import('./components/events/events'));
const VideoList = lazy(() => import('./components/videos/VideoList'));
const RoomDetails = lazy(() => import("./components/booking/bookingContent/roomDetails"));
const Gallery = lazy(() => import('./components/gallery/gallery'));
const ProfilePage = lazy(() => import('./components/menumain/Profilepage'));
const EventRegistrationForm = lazy(() => import('./components/eventregistration/eventregistration'));
const AdminDashboard = lazy(() => import('./components/admin/admin'));
const Users = lazy(() => import('./components/admin/users/users'));
const AddEvent = lazy(() => import('./components/admin/events/addevent'));
const AddBooking = lazy(() => import('./components/admin/booking/addbooking'));
const UploadBooks = lazy(() => import('./components/admin/books/uploadbooks'));
const UpdateUser = lazy(() => import('./components/admin/users/updateuser'));
const VideoUpload = lazy(() => import('./components/admin/videos/videoupload'));
const EventList = lazy(() => import('./components/admin/events/eventlist'));
const RoomList = lazy(() => import('./components/admin/booking/roomlist'));
const EventDetails = lazy(() => import('./components/admin/events/eventdetails'));
const UserCredits = lazy(() => import('./components/admin/users/usercredits'));
const BookingConfirmation = lazy(() => import('./components/admin/booking/bookingconfirmation'));
const BlockRooms = lazy(() => import('./components/admin/booking/blockrooms'));
const ImageUpload = lazy(() => import('./components/admin/images/imageupload'));
const HomeImageUpload = lazy(() => import('./components/admin/images/homeimageupload'));
const ManualBooking = lazy(() => import('./components/admin/manualbooking/manualbooking'));
const DailyAvailability = lazy(() => import('./components/admin/dailyavailability/dailyavailability'));
const ForgotPassword = lazy(() => import('./components/login/forgotpassword'));


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
        <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading page...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/book" element={<Book />} />
            <Route path="/events" element={<Events />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/videos" element={<VideoList />} />
            <Route path="/room-details" element={<RoomDetails />} />
            <Route path="/gallery" element={<Gallery />} />

            <Route
              path="/login"
              element={<PublicOnlyRoute element={<Login />} />}
            />
            <Route
              path="/registration"
              element={<PublicOnlyRoute element={<AppRegistration />} />}
            />
            <Route
              path="/forgot-password"
              element={<PublicOnlyRoute element={<ForgotPassword />} />}
            />

            <Route element={<UserProtectedRoute />}>
              <Route path="/profileview" element={<ProfilePage />} />
              <Route path="/eventregister/:eventId" element={<EventRegistrationForm />} />
            </Route>

            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/addevent" element={<AddEvent />} />
              <Route path="/addrooms" element={<AddBooking />} />
              <Route path="/uploadbook" element={<UploadBooks />} />
              <Route path="/updateuser" element={<UpdateUser />} />
              <Route path="/videoupload" element={<VideoUpload />} />
              <Route path="/imageupload" element={<ImageUpload />} />
              <Route path="/homeimageupload" element={<HomeImageUpload />} />
              <Route path="/eventlist" element={<EventList />} />
              <Route path="/roomlist" element={<RoomList />} />
              <Route path="/eventdetails" element={<EventDetails />} />
              <Route path="/bookingconfirmation" element={<BookingConfirmation />} />
              <Route path="/usercredits" element={<UserCredits />} />
              <Route path="/blockrooms" element={<BlockRooms />} />
              <Route path="/manualbooking" element={<ManualBooking />} />
              <Route path="/roomsavailability" element={<DailyAvailability />} />
            </Route>
            <Route path="*" element={<div><h1>404 - Page Not Found</h1></div>} />

          </Routes>
        </Suspense>
      </Router>
    </div>
  );
};

export default App;