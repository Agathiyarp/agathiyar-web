import React, { useEffect, useRef, useState } from 'react';
import './manualbooking.css';
import { useNavigate } from 'react-router-dom';
import MenuBar from "../../menumain/menubar";

const initialForm = {
  bookingid: '',
  name: '',
  age: '',
  gender: '',
  roomname: '',      // kept as-is; we’ll store the chosen destination here
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
  const [matchMessage, setMatchMessage] = useState({ text: '', type: '' }); 

  // destinations (populates the "Select Destination" dropdown)
  const [rooms, setRooms] = useState([]); // keep the var name to minimize changes; values are destinations
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState('');

  // booking autofill state
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState('');

  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // --- Utils ---
  const toYMD = (dLike) => {
    if (!dLike) return '';
    const d = new Date(dLike);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const norm = (v) => (v === undefined || v === null ? '' : String(v).trim());

  // Try a bunch of key variants safely
  const pick = (obj, keys = []) => {
    for (const k of keys) {
      if (obj?.[k] !== undefined && obj?.[k] !== null && String(obj?.[k]).length > 0) {
        return obj[k];
      }
    }
    return '';
  };

  // --- Fetch unique "destination" values once to populate dropdown ---
  useEffect(() => {
    const fetchDestinations = async () => {
      setRoomsLoading(true);
      setRoomsError('');
      try {
        const res = await fetch('https://www.agathiyarpyramid.org/api/bookings');
        const data = await res.json().catch(() => null);

        const collectDest = (obj) =>
          obj?.destination ??
          obj?.Destination ??
          obj?.dest ??
          obj?.place ??
          // final fallbacks if some rows still use room fields:
          obj?.roomname ?? obj?.roomName ?? obj?.room ?? obj?.RoomName ?? null;

        let candidates = [];
        if (Array.isArray(data)) {
          candidates = data.map(collectDest);
        } else if (data && typeof data === 'object') {
          const buckets = [
            Array.isArray(data.bookings) ? data.bookings : [],
            Array.isArray(data.records) ? data.records : [],
            Array.isArray(data.data) ? data.data : [],
          ].flat();
          candidates = buckets.map(collectDest);
        }

        const unique = [...new Set(candidates.filter(Boolean).map(String))]
          .sort((a, b) => a.localeCompare(b));

        setRooms(unique);
        if (unique.length === 0) setRoomsError('No destinations found. You can retry later.');
      } catch (err) {
        console.error('Destinations fetch failed:', err);
        setRoomsError('Failed to load destinations. Please try again.');
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // --- Autofill booking details when bookingid is entered ---
  const fetchAndHydrateByBookingId = async (bookingIdRaw) => {
    const bookingId = norm(bookingIdRaw);
    if (!bookingId) return;

    setAutoLoading(true);
    setAutoError('');
    setMatchMessage('');
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/bookings');
      const data = await res.json();

      const toIdString = (item) => {
        const found =
          pick(item, ['bookingid', 'bookingId', 'BookingId', 'id', 'booking_id', 'BookingID']) ||
          pick(item?.booking ?? {}, ['id', 'bookingId']);
        return norm(found);
      };

      // find matches
      let matches = [];
      if (Array.isArray(data)) {
        matches = data.filter((it) => toIdString(it) === bookingId);
      } else if (data && typeof data === 'object') {
        const arrs = [
          Array.isArray(data.bookings) ? data.bookings : [],
          Array.isArray(data.records) ? data.records : [],
          Array.isArray(data.data) ? data.data : [],
        ].flat();
        matches = arrs.filter((it) => toIdString(it) === bookingId);
      }

      if (!matches.length) {
        // Treat as NEW booking id: do NOT error, do NOT reset form
        setAutoError('');
        setMatchMessage({ text: `No existing record found. Using as NEW Booking ID: ${bookingId}`, type: 'info' });
        setAutoLoading(false);
        return;
      }

      // If multiple, prefer most recent by created/updated date field if available
      const scoreTime = (it) => {
        const t =
          pick(it, ['updatedAt', 'updated_at', 'createdAt', 'created_at', 'createddate', 'createdDate']) ||
          pick(it?.booking ?? {}, ['updatedAt', 'createdAt']);
        const ts = Date.parse(t);
        return isNaN(ts) ? 0 : ts;
      };
      const record = matches.reduce((a, b) => (scoreTime(a) >= scoreTime(b) ? a : b));

      // Extract fields (robust to naming)
      const start =
        pick(record, ['startdate', 'startDate', 'checkin', 'checkIn', 'fromDate', 'from']) ||
        pick(record?.booking ?? {}, ['startDate', 'checkIn', 'from']);

      const end =
        pick(record, ['enddate', 'endDate', 'checkout', 'checkOut', 'toDate', 'to']) ||
        pick(record?.booking ?? {}, ['endDate', 'checkOut', 'to']);

      // Prefer "destination" as the dropdown value; fallback to room fields
      const roomOrDest =
        pick(record, ['destination', 'Destination', 'dest', 'place']) ||
        pick(record?.booking ?? {}, ['destination', 'place']) ||
        pick(record, ['roomname', 'roomName', 'room', 'RoomName']) ||
        pick(record?.booking ?? {}, ['roomName', 'room']);

      const addr =
        pick(record, ['address', 'Address', 'addr']) ||
        pick(record?.guest ?? {}, ['address']);

      const payMode =
        pick(record, ['modeOfPayment', 'paymentMode', 'payment_method', 'paymentMethod']) ||
        pick(record?.payment ?? {}, ['mode', 'paymentMode']);

      setFormData((prev) => ({
        ...prev,
        startdate: toYMD(start) || prev.startdate,
        enddate: toYMD(end) || prev.enddate,
        roomname: norm(roomOrDest) || prev.roomname, // store destination/room into roomname field
        address: norm(addr) || prev.address,
        modeOfPayment: norm(payMode) || prev.modeOfPayment,
      }));
      setMatchMessage({ text: `Match found for Booking ID: ${bookingId}`, type: 'success' });
    } catch (err) {
      console.error('Autofill fetch failed:', err);
      setAutoError('Failed to fetch booking details. Please try again.');
    } finally {
      setAutoLoading(false);
    }
  };


  // Debounce autofill while typing bookingid
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    setAutoError('');
    if (!formData.bookingid) return;
    debounceTimer.current = setTimeout(() => {
      fetchAndHydrateByBookingId(formData.bookingid);
    }, 600);
    return () => clearTimeout(debounceTimer.current);
  }, [formData.bookingid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookingIdBlur = () => {
    // Trigger immediate fetch on blur as well (cancels debounce)
    clearTimeout(debounceTimer.current);
    if (formData.bookingid) fetchAndHydrateByBookingId(formData.bookingid);
  };

  // --- Handlers ---
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

    // Clear autofill error if bookingid changes
    if (name === 'bookingid') setAutoError('');

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const e = {};

    // Required checks: all except bookingid
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'bookingid') return;
      if (!String(v || '').trim()) e[k] = 'This field is required';
    });

    // Age: 1-120
    if (!e.age) {
      const ageNum = Number(formData.age);
      if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        e.age = 'Enter a valid age between 1 and 120';
      }
    }

    // Gender
    if (!e.gender && !['male', 'female', 'other'].includes(formData.gender)) {
      e.gender = 'Select a valid gender';
    }

    // Email
    if (!e.email) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      if (!emailOk) e.email = 'Enter a valid email address';
    }

    // Phone
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

      {(loading || autoLoading) && (
        <div className="manual-booking-loader">
          {loading ? 'Submitting...' : 'Loading booking details...'}
        </div>
      )}

      {autoError && (
        <div className="manual-booking-error" style={{ marginBottom: 12 }}>
          {autoError}
        </div>
      )}

      {matchMessage.text && (
        <div
          style={{
            marginBottom: 12,
            color: matchMessage.type === 'success' ? 'green' : 'red',
            fontWeight: 500
          }}
        >
          {matchMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="manual-booking-container">
        {/* Row 0 - Booking ID (optional) */}
        <div className="manual-booking-row">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="bookingid"
              placeholder="Search or enter Booking ID"
              value={formData.bookingid}
              onChange={handleChange}
              onBlur={handleBookingIdBlur}
              aria-invalid={!!errors.bookingid}
              aria-describedby="err-bookingid"
              autoCapitalize="off"
              autoCorrect="off"
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

          {/* Destination dropdown (stored in roomname) */}
          <div style={{ flex: 1 }}>
            <select
              name="roomname"
              value={formData.roomname}
              onChange={handleChange}
              required
              aria-invalid={!!errors.roomname}
              aria-describedby="err-roomname"
              disabled={roomsLoading || !!roomsError}
            >
              <option value="">
                {roomsLoading ? 'Loading destinations...' : roomsError ? 'Destinations unavailable' : 'Select Destination'}
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
