import React, { useState, useEffect } from "react";
import MenuBar from "../../menumain/menubar";
import "./bookingContent.css";
import { useNavigate } from "react-router-dom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RoomBook = ({ searchResult, enabledDateRanges }) => {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [disabledDates, setDisabledDates] = useState({});



  const navigate = useNavigate();
  const MAX_DAYS_ALLOWED = 10;

  const userInfo = sessionStorage.getItem('userDetails')
  const userDetails = userInfo ? JSON.parse(userInfo): '';

  const userType = userDetails?.usertype?.trim().toLowerCase() || "";

  // Helper to format date
  const formatDate = (date) => date.toISOString().split("T")[0];

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const ci = formatDate(today);
    const co = formatDate(tomorrow);

    setCheckInDate(ci);
    setCheckOutDate(co);

    const result =
      searchResult?.filter(
        (room) => !room.bookingDate || room.bookingDate.startsWith(ci)
      ) || [];

    setFilteredRooms(result);

    const fetchedRoomTypes = new Set();
    result.forEach(room => {
      const key = normalizeRoomName(room.roomname);
      if (key && !fetchedRoomTypes.has(key)) {
        fetchedRoomTypes.add(key);
        console.log(key, "test key")
        fetchBlockedDatesForRoom(key);
      }
    });

  }, [searchResult]);

  const normalizeRoomName = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("agathiyar")) return "agathiyar";
    if (lower.includes("patriji")) return "patriji";
    if (lower.includes("dormitory")) return "dormitory";
    return "";
  };

  const isDateInRange = (date, start, end) => {
    const d = new Date(date);
    return new Date(start) <= d && d <= new Date(end);
  };

  const isBookingBlocked = () => {
    return enabledDateRanges.some(({ startDate, endDate }) =>
      isDateInRange(checkInDate, startDate, endDate) ||
      isDateInRange(checkOutDate, startDate, endDate)
    );
  };

  const fetchBlockedDatesForRoom = async (roomTypeKey) => {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    const start = formatDate(today);
    const end = formatDate(future);

    try {
      const res = await fetch(`https://www.agathiyarpyramid.org/api/dailyrooms?start=${start}&end=${end}`);
      const data = await res.json();

      const blocked = data
        .filter(entry => entry[roomTypeKey] === 0)
        .map(entry => entry.date);

      setDisabledDates(prev => ({
        ...prev,
        [roomTypeKey]: Array.from(new Set([...(prev[roomTypeKey] || []), ...blocked])),
      }));
    } catch (err) {
      console.error(`Failed to fetch blocked dates for ${roomTypeKey}:`, err);
    }
  };

  const countValidDays = (start, end, blockedDates = []) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const blockedSet = new Set(blockedDates); // for fast lookup

    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd}`;

      if (!blockedSet.has(formatted)) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  };



  const handleRoomSelect = (room) => {
    if (userType === "donar" && room.roomname === "Patriji Bhavan") {
      alert(`Donar cannot book Patriji Room`);
      return;
    }
    const isLoggedIn = sessionStorage.getItem("userDetails");

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffDays = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

    if (isBookingBlocked()) {
      alert(`Booking is not allowed between restricted dates.\nPlease select a different check-in or check-out Date.`);
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after the check-in date.");
      return;
    }

    if (diffDays > MAX_DAYS_ALLOWED) {
      alert(`Check-in and check-out difference cannot exceed ${MAX_DAYS_ALLOWED} days.`);
      return;
    }
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate("/room-details", {
      state: {
        room,
        checkIn,
        checkOut,
      },
    });
  };

  return (
    <div className="room-search-results">
      <MenuBar />
      <div className="room-search-results__content">
        <div className="room-search-results__list">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const roomKey = room._id;
              const normalizedRoomType = normalizeRoomName(room.roomname);
              const checkInDisabledDates = disabledDates[normalizedRoomType] || [];

              return (
                <div key={roomKey} className="room-card">
                  <div className="room-card__image-container">
                    <img
                      src={room.image}
                      alt={room.roomtype}
                      className="room-card__image"
                    />
                  </div>

                  <div className="room-card__content">
                    <div>
                      <div className="room-card__header">
                        <h2 className="room-card__name">{room.roomname}</h2>
                      </div>
                      <p className="room-card__description">
                        {room.roomdescription}
                      </p>

                      <div className="room_card_dates">
                        <p className="room-card__date">
                          <RestaurantIcon fontSize="small" className="icon" />
                          <span className="semi-bold">Food Facility:</span> Yes
                        </p>
                        <p className="room-card__date">
                          <DirectionsCarIcon
                            fontSize="small"
                            className="icon"
                          />
                          <span className="semi-bold">Parking:</span> No
                        </p>
                        <p className="room-card__date">
                          <span className="icon-date">🛏️</span>
                          <span className="semi-bold">Maintenance:</span> Yes
                        </p>
                        <p className="room-card__date">
                          <span className="icon-date">🕒</span>
                          <span className="semi-bold">
                            Days Selected:
                          </span>{" "}
                          {countValidDays(checkInDate, checkOutDate, checkInDisabledDates)}
                        </p>
                          <>
                            <div className="checkin-date">
                              <label className="semi-bold">
                                <span className="icon-date">🗓️</span>
                                <span>Check-In Date:</span>
                              </label>
                              <DatePicker
                                selected={new Date(checkInDate)}
                                onChange={(date) => {
                                  const formatted = formatDate(date);
                                  if (checkInDisabledDates.includes(formatted)) {
                                    alert("This Check-In date is unavailable.");
                                    return;
                                  }
                                  setCheckInDate(formatted);
                                }}
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date()}
                                excludeDates={checkInDisabledDates.map(dateStr => new Date(dateStr))}
                                className="date-input"
                                dayClassName={(date) => {
                                  const yyyy = date.getFullYear();
                                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                                  const dd = String(date.getDate()).padStart(2, '0');
                                  const formatted = `${yyyy}-${mm}-${dd}`;
                                  console.log(disabledDates, 'formatted:', formatted);

                                  return checkInDisabledDates.includes(formatted) ? "blocked-date" : undefined;
                                }}
                              />
                            </div>

                            <div className="checkout-date">
                              <label className="semi-bold">
                                <span className="icon-date">🗓️</span>
                                <span>Check-Out Date:</span>
                              </label>
                              <DatePicker
                                selected={new Date(checkOutDate)}
                                onChange={(date) => {
                                  const formatted = formatDate(date);
                                  const diffDays =
                                    (date - new Date(checkInDate)) / (1000 * 60 * 60 * 24);

                                  if (checkInDisabledDates.includes(formatted)) {
                                    alert("This Check-Out date is unavailable.");
                                    return;
                                  }

                                  if (diffDays > MAX_DAYS_ALLOWED) {
                                    alert(`Check-in and Check-out difference cannot exceed ${MAX_DAYS_ALLOWED} days.`);
                                  } else {
                                    setCheckOutDate(formatted);
                                  }
                                }}
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date()}
                                excludeDates={checkInDisabledDates.map(dateStr => new Date(dateStr))}
                                className="date-input"
                                dayClassName={(date) => {
                                  const yyyy = date.getFullYear();
                                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                                  const dd = String(date.getDate()).padStart(2, '0');
                                  const formatted = `${yyyy}-${mm}-${dd}`;
                                  console.log(disabledDates, 'formatted:', formatted);

                                  return checkInDisabledDates.includes(formatted) ? "blocked-date" : undefined;
                                }}
                              />
                            </div>
                          </>
                      </div>
                    </div>

                    <div className="room-card__booking">
                      <button
                        onClick={() => handleRoomSelect(room)}
                        className={`room-card__view-deal`}
                      >
                        SELECT ROOM
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-red-600 text-lg">
              No Rooms Available for selected date
            </div>
          )}
        </div>
      </div>
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Please Login</h2>
            <p>You need to log in to proceed with booking.</p>
            <div className="modal-buttons">
              <button className="gotologin" onClick={() => navigate("/login")}>
                Go to Login
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBook;
