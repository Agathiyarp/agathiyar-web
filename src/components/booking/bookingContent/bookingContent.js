import React, { useState, useEffect } from "react";
import MenuBar from "../../menumain/menubar";
import "./bookingContent.css";
import { useNavigate } from "react-router-dom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

const RoomBook = ({ searchResult }) => {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0];

    setCheckInDate(formatDate(today));
    setCheckOutDate(formatDate(tomorrow));

    const result =
      searchResult?.filter((room) => {
        if (!room.bookingDate) return true;
        return room.bookingDate.startsWith(formatDate(today));
      }) || [];

    setFilteredRooms(result);
  }, [searchResult]);

  const handleRoomSelect = (room) => {
    navigate("/room-details", { state: { room } });
  };

  return (
    <div className="room-search-results">
      <MenuBar />
      <div className="room-search-results__content">
        <div className="room-search-results__list">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const isAvailable = room.availableRooms > 0;
              return (
                <div key={room.eventid} className="room-card">
                  <div className="room-card__image-container">
                    <img
                      src={room.image}
                      alt={room.roomtype}
                      className="room-card__image"
                    />
                    {/* <span className="room-card__image-counter">
                      1 / {room.id === 2 ? 3 : room.id === 3 ? 8 : 10}
                    </span> */}
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
                          <span className="semi-bold">Food Facility:</span>
                          No
                        </p>
                        <p className="room-card__date">
                          <DirectionsCarIcon
                            fontSize="small"
                            className="icon"
                          />
                          <span className="semi-bold">Parking:</span>
                          No
                        </p>

                        {!isAvailable ? (
                          <>
                            <div className="checkin-date">
                              <label className="semi-bold">
                                Check-In Date:
                              </label>
                              <input
                                type="date"
                                value={checkInDate}
                                onChange={(e) =>
                                  setCheckInDate(e.target.value)
                                }
                                className="date-input"
                              />
                            </div>

                            <div className="checkout-date">
                              <label className="semi-bold">
                                Check-Out Date:
                              </label>
                              <input
                                type="date"
                                value={checkOutDate}
                                onChange={(e) =>
                                  setCheckOutDate(e.target.value)
                                }
                                className="date-input"
                              />
                            </div>

                            <p className="days-selected">
                              🗓️ <span className="semi-bold">Days Selected:</span>{" "}
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
                              Rooms Available: {room.availableRooms}
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
    </div>
  );
};

export default RoomBook;
