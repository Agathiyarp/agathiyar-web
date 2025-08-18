import React, { useEffect, useState } from 'react';
import './manualbooking.css'; // uses same structure as your addbooking.css with a small .error addition
import { useNavigate } from 'react-router-dom';
import MenuBar from "../../menumain/menubar";

const initialForm = {
  bookingid: '',
  name: '',
  age: '',
  gender: '',
  roomname: '',
  address: '',
  phone: '',
  email: '',
  startdate: '',
  enddate: '',
  modeOfPayment: '',
};

const ManualBooking = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState('');
  const navigate = useNavigate();

  // Fetch rooms once (per given date in your requirement)
  useEffect(() => {
    const fetchRooms = async () => {
      setRoomsLoading(true);
      setRoomsError('');
      try {
        const res = await fetch('https://agathiyarpyramid.org/api/getBookingRecords?date=2025-08-18');
        const data = await res.json().catch(() => null);

        // Try to derive room names from different possible shapes
        let candidates = [];
        if (Array.isArray(data)) {
          candidates = data.map(
            (b) => b?.roomname ?? b?.roomName ?? b?.room ?? b?.RoomName ?? null
          );
        } else if (data && typeof data === 'object') {
          const arrs = [
            Array.isArray(data.rooms) ? data.rooms : [],
            Array.isArray(data.availableRooms) ? data.availableRooms : [],
            Array.isArray(data.records) ? data.records : [],
          ].flat();

          if (arrs.length) {
            candidates = arrs.map(
              (b) => b?.roomname ?? b?.roomName ?? b?.room ?? b?.RoomName ?? (typeof b === 'string' ? b : null)
            );
          }
        }

        const unique = [...new Set(candidates.filter(Boolean))].sort((a, b) =>
          String(a).localeCompare(String(b))
        );

        setRooms(unique);
        if (unique.length === 0) setRoomsError('No rooms found. You can retry submission later.');
      } catch (err) {
        console.error('Rooms fetch failed:', err);
        setRoomsError('Failed to load rooms. Please try again.');
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Basic coercions for specific fields
    if (name === 'age') {
      const onlyDigits = value.replace(/\D/g, '');
      setFormData((p) => ({ ...p, [name]: onlyDigits }));
      return;
    }
    if (name === 'phone') {
      const onlyDigits = value.replace(/[^\d+]/g, '').slice(0, 15);
      setFormData((p) => ({ ...p, [name]: onlyDigits }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const e = {};

    // Required checks: all except bookingid
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'bookingid') return; // optional
      if (!String(v || '').trim()) e[k] = 'This field is required';
    });

    // Age: 1-120
    if (!e.age) {
      const ageNum = Number(formData.age);
      if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        e.age = 'Enter a valid age between 1 and 120';
      }
    }

    // Gender: restrict to known
    if (!e.gender && !['male', 'female', 'other'].includes(formData.gender)) {
      e.gender = 'Select a valid gender';
    }

    // Email format
    if (!e.email) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      if (!emailOk) e.email = 'Enter a valid email address';
    }

    // Phone: minimum 10 digits (allow leading +)
    if (!e.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 10) e.phone = 'Enter a valid phone number (min 10 digits)';
    }

    // Dates: start <= end
    if (!e.startdate && !e.enddate) {
      const start = new Date(formData.startdate);
      const end = new Date(formData.enddate);
      if (start > end) e.enddate = 'End date cannot be before start date';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/manualbooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createddate: new Date().toISOString(),
        }),
      });

      const text = await res.text();

      if (res.ok) {
        alert('Manual booking submitted successfully!');
        setFormData(initialForm);
        setErrors({});
        setLoading(false);
        setTimeout(() => navigate('/admin'), 1200);
      } else {
        alert('Submission failed: ' + text);
        setLoading(false);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error occurred. See console for details.');
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <MenuBar />
      <h2>Manual Booking</h2>
      <p className="manual-booking-note">
        *All fields are mandatory, except Booking ID
      </p>
      {loading && <div className="manual-booking-loader">Submitting...</div>}

      <form onSubmit={handleSubmit} className="manual-booking-container">
        {/* Row 0 - Booking ID (optional) */}
        <div className="manual-booking-row">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="bookingid"
              placeholder="Booking ID (optional)"
              value={formData.bookingid}
              onChange={handleChange}
              aria-invalid={!!errors.bookingid}
              aria-describedby="err-bookingid"
            />
            {errors.bookingid && (
              <div id="err-bookingid" className="manual-booking-error">{errors.bookingid}</div>
            )}
          </div>
        </div>

        {/* Row 1 */}
        <div className="manual-booking-row">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-invalid={!!errors.name}
              aria-describedby="err-name"
            />
            {errors.name && <div id="err-name" className="manual-booking-error">{errors.name}</div>}
          </div>

          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
              aria-invalid={!!errors.age}
              aria-describedby="err-age"
            />
            {errors.age && <div id="err-age" className="manual-booking-error">{errors.age}</div>}
          </div>
        </div>

        {/* Row 2 */}
        <div className="row">
          <div style={{ flex: 1 }}>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              aria-invalid={!!errors.gender}
              aria-describedby="err-gender"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <div id="err-gender" className="manual-booking-error">{errors.gender}</div>}
          </div>

          {/* Room Name dropdown */}
          <div style={{ flex: 1 }}>
            <select
              name="roomname"
              value={formData.roomname}
              onChange={handleChange}
              required
              aria-invalid={!!errors.roomname}
              aria-describedby="err-roomname"
              disabled={roomsLoading || roomsError}
            >
              <option value="">
                {roomsLoading ? 'Loading rooms...' : roomsError ? 'Rooms unavailable' : 'Select Room'}
              </option>
              {!roomsLoading && !roomsError && rooms.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.roomname && <div id="err-roomname" className="manual-booking-error">{errors.roomname}</div>}
            {roomsError && <div className="manual-booking-error" style={{ marginTop: 6 }}>{roomsError}</div>}
          </div>
        </div>

        {/* Row 3 */}
        <div className="row">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              aria-invalid={!!errors.phone}
              aria-describedby="err-phone"
            />
            {errors.phone && <div id="err-phone" className="manual-booking-error">{errors.phone}</div>}
          </div>

          <div style={{ flex: 1 }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-invalid={!!errors.email}
              aria-describedby="err-email"
            />
            {errors.email && <div id="err-email" className="manual-booking-error">{errors.email}</div>}
          </div>
        </div>

        {/* Row 4 */}
        <div className="row">
          <div style={{ flex: 1 }}>
            <input
              type="date"
              name="startdate"
              placeholder="Start Date"
              value={formData.startdate}
              onChange={handleChange}
              required
              aria-invalid={!!errors.startdate}
              aria-describedby="err-startdate"
            />
            {errors.startdate && <div id="err-startdate" className="manual-booking-error">{errors.startdate}</div>}
          </div>

          <div style={{ flex: 1 }}>
            <input
              type="date"
              name="enddate"
              placeholder="End Date"
              value={formData.enddate}
              onChange={handleChange}
              required
              aria-invalid={!!errors.enddate}
              aria-describedby="err-enddate"
            />
            {errors.enddate && <div id="err-enddate" className="manual-booking-error">{errors.enddate}</div>}
          </div>
        </div>

        {/* Row 5 - Mode of Payment (required) */}
        <div className="row">
          <div style={{ flex: 1 }}>
            <select
              name="modeOfPayment"
              value={formData.modeOfPayment}
              onChange={handleChange}
              required
              aria-invalid={!!errors.modeOfPayment}
              aria-describedby="err-modeOfPayment"
            >
              <option value="">Mode of Payment</option>
              <option value="Credits">Credits</option>
              <option value="Cash/Online">Cash/Online</option>
            </select>
            {errors.modeOfPayment && (
              <div id="err-modeOfPayment" className="manual-booking-error">{errors.modeOfPayment}</div>
            )}
          </div>
          <div style={{ flex: 1 }} />
        </div>

        {/* Address (full width) */}
        <div className="row" style={{ flexDirection: 'column' }}>
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            aria-invalid={!!errors.address}
            aria-describedby="err-address"
          />
          {errors.address && <div id="err-address" className="manual-booking-error">{errors.address}</div>}
        </div>

        <button type="submit" className="manual-booking-submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
};

export default ManualBooking;
