import React, { useState, useEffect } from "react";
import MenuBar from "../../menumain/menubar";
import "./bookingContent.css";
import { useNavigate } from "react-router-dom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import axios from "axios";

const RoomBook = ({ searchResult }) => {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomAvailability, setRoomAvailability] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // Helper to format date
  const formatDate = (date) => date.toISOString().split("T")[0];

  // Fetch availability from API
  const fetchRoomAvailability = async (rooms, checkIn, checkOut) => {
    const availabilityMap = {};
    await Promise.all(
      rooms.map(async (room) => {
        try {
          const response = await axios.get(
            "https://agathiyarpyramid.org/api/checkRoomAvailability",
            {
              params: {
                roomId: room._id,
                checkIn,
                checkOut,
              },
            }
          );
          console.log("Room Availability Response:", response.data.totalRooms);
          availabilityMap[room._id] = response?.data?.totalRooms || 0;
        } catch (error) {
          console.error("Error fetching room availability", error);
          availabilityMap[room._id] = 0;
        }
      })
    );
    setRoomAvailability(availabilityMap);
  };

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const ci = formatDate(today);
    const co = formatDate(tomorrow);

    setCheckInDate(ci);
    setCheckOutDate(co);

    const result =
      searchResult?.filter((room) => !room.bookingDate || room.bookingDate.startsWith(ci)) || [];

    setFilteredRooms(result);

    if (result.length > 0) {
      fetchRoomAvailability(result, ci, co);
    }
  }, [searchResult]);

  // Re-fetch availability when dates change
  useEffect(() => {
    if (filteredRooms.length > 0) {
      fetchRoomAvailability(filteredRooms, checkInDate, checkOutDate);
    }
  }, [checkInDate, checkOutDate]);

  const handleRoomSelect = (room) => {
    const isLoggedIn = sessionStorage.getItem("userDetails");
    console.log("userDetails:", sessionStorage.getItem("userDetails"));
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate("/room-details", {
      state: {
        room,
        checkInDate,
        checkOutDate,
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
              const availableRooms = roomAvailability[roomKey] ? roomAvailability[roomKey] : (room?.totalrooms || 0);
              const isAvailable = availableRooms > 0;

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
                        <h2 className="room-card__name">{room.destination}</h2>
                      </div>
                      <p className="room-card__description">
                        {room.roomdescription}
                      </p>

                      <div className="room_card_dates">
                        <p className="room-card__date">
                          <RestaurantIcon
                            fontSize="small"
                            className="icon"
                          />
                          <span className="semi-bold">Food Facility:</span> No
                        </p>
                        <p className="room-card__date">
                          <DirectionsCarIcon
                            fontSize="small"
                            className="icon"
                          />
                          <span className="semi-bold">Parking:</span> No
                        </p>

                        {isAvailable ? (
                          <>
                        <div className="checkin-date">
                          <label className="semi-bold">
                            <span className="icon-date">🗓️</span>
                            <span>Check-In Date:</span>
                          </label>
                          <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="date-input"
                          />
                        </div>

                        <div className="checkout-date">
                          <label className="semi-bold">
                            <span className="icon-date">🗓️</span>
                            <span>Check-Out Date:</span>
                          </label>
                          <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="date-input"
                          />
                        </div>

                        <p className="days-selected">
                          <span className="icon-date">🕒</span>
                          <span className="semi-bold">Days Selected:</span>{" "}
                          {Math.max(
                            1,
                            Math.ceil(
                              (new Date(checkOutDate) -
                                new Date(checkInDate)) /
                                (1000 * 60 * 60 * 24)
                            )
                          )}
                        </p>

                        <p className="available-text">
                          <span className="icon-date">🛏️</span>
                          Rooms Available: {availableRooms}
                        </p>
                          </>
                        ) : (
                          <p className="unavailable-text">
                            No Rooms Available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="room-card__booking">
                      <button
                        onClick={() => handleRoomSelect(room)}
                        className={`room-card__view-deal ${
                          isAvailable ? "" : "disabled"
                        }`}
                        disabled={!isAvailable}
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
              <button className="gotologin" onClick={() => navigate("/login")}>Go to Login</button>
              <button className="cancel-btn" onClick={() => setShowLoginModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBook;
