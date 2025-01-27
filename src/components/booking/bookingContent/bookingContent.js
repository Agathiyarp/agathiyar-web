import React, { useState, useEffect } from "react";
import MenuBar from "../../menumain/menubar";
import "./bookingContent.css";
import { useNavigate } from "react-router-dom";
import EventIcon from '@mui/icons-material/Event';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const RoomBook = ({ data, searchResult }) => {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // const [showSummary, setShowSummary] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    setCheckInDate(formatDate(today));
    setCheckOutDate(formatDate(tomorrow));
  });

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    navigate("/room-details", { state: { room } });
    // setShowSummary(true);
    console.log(selectedRoom, "selectedRoom");
  };

  return (
    <div className="room-search-results max-w-7xl mx-auto p-4 font-sans">
      <MenuBar />
      <div className="room-search-results__content flex">
        <div className="room-search-results__list w-2/3 pr-4">
          {searchResult &&
            searchResult.map((room) => (
              <div
                key={room.id}
                className="room-card bg-white rounded-lg shadow-md p-4 mb-4 flex"
              >
                <div className="room-card__image-container relative w-1/3 mr-4">
                  <div className="relative">
                    <img
                      src={room.image}
                      alt={room.roomtype}
                      className="room-card__image w-full h-48 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 z-[-1] rounded-lg transform translate-x-2 translate-y-2 bg-gray-200 shadow-md"></div>
                    <div className="absolute inset-0 z-[-2] rounded-lg transform translate-x-4 translate-y-4 bg-gray-300 shadow-md"></div>
                  </div>
                  <span className="room-card__image-counter absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    1 / {room.id === 2 ? 3 : room.id === 3 ? 8 : 10}
                  </span>
                </div>
                <div className="room-card__content w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="room-card__header flex justify-between items-start">
                      <h2 className="room-card__name text-xl font-semibold">
                        {room.destination}
                      </h2>
                    </div>
                    <p className="room-card__description text-sm text-gray-600 mt-1">
                      {room.roomdescription}
                    </p>
                    <div className="room_card_dates">
                      <p className="room-card__date text-sm text-gray-600 mt-1 p-r-100">
                        <EventIcon fontSize="small" className="text-gray-600 align-middle pr-1" />
                        <span className="semi-bold">{"CheckIn: "}</span><br/>{checkInDate}{" 12 PM"}
                      </p>
                      <p className="room-card__date text-sm text-gray-600 mt-1 p-r-100">
                        <EventIcon fontSize="small" className="text-gray-600 align-middle pr-1" />
                        <span className="semi-bold">{"CheckOut: "}</span><br/>{checkOutDate}{" 12 PM"}
                      </p>
                      <p className="room-card__date text-sm text-gray-600 mt-1 p-r-100">
                        <RestaurantIcon fontSize="small" className="text-gray-600 align-middle pr-1" />
                        <span className="semi-bold">{"Food Facility:"}</span><br/>{"No"}
                      </p>
                      <p className="room-card__date text-sm text-gray-600 mt-1">
                        <DirectionsCarIcon fontSize="small" className="text-gray-600 align-middle pr-1" />
                        <span className="semi-bold"> {"Parking:"}</span><br/>{"No"}
                      </p>
                    </div>
                  </div>

                  <div className="room-card__booking text-right">
                    <button
                      onClick={() => handleRoomSelect(room)}
                      className="room-card__view-deal bg-green-600 text-white px-4 py-2 rounded mt-2 flex items-center"
                    >
                      SELECT ROOM
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {/* {searchResult && searchResult[0] && <RoomSelection selectedRoom={searchResult[0]} searchData={data}/>} */}
      </div>
    </div>
  );
};
export default RoomBook;
