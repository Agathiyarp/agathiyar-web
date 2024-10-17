import React, { useState } from "react"; // Ensure useState is imported
import { ChevronRight } from "lucide-react";
import MenuBar from "../../menumain/menubar"; // Import the MenuBar
import "./bookingContent.css";
import mainlogo from "../../../images/mainlogo.png"; // Adjust the path as necessary
import ConfirmModal from "../confirmModal";
import RoomSelection from "./roomSelection";
const RoomBook = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const rooms = [
    {
      id: 1,
      name: "Room Type I(2 beds, A/C Room)",
      type: "A/C Room",
      description:
        "Family Friendly Atmosphere, Explore Meditaiton, Food and Swadhyayam",
      score: { value: 8.3, text: "Very good", ratings: 775 },
      price: { value: 17532, nights: 26, total: 455825 },
      image: mainlogo,
      noOfAvailableRooms: 10
    },
    {
      id: 2,
      name: "Room Type II(2 beds, Non A/C Room)",
      type: "Non A/C Room",
      description:
        "Family Friendly Atmosphere, Explore Meditaiton, Food and Swadhyayam",
      score: { value: 5.5, text: "", ratings: 6 },
      price: { value: 23320, nights: 26, total: 606314 },
      image: mainlogo,
      noOfAvailableRooms: 20
    },
    {
      id: 3,
      name: "Room Type III(3 beds, A/C Room)",
      type: "A/C Room",
      description:
        "Family Friendly Atmosphere, Explore Meditaiton, Food and Swadhyayam",
      score: { value: 6.4, text: "", ratings: 351 },
      price: { value: 10541, nights: 26, total: 274070 },
      image: mainlogo,
      popularChoice: true,
      noOfAvailableRooms: 30
    },
    {
      id: 4,
      name: "Room Type IV(3 beds, Non A/C Room)",
      type: "Non A/C Room",
      description:
        "Family Friendly Atmosphere, Explore Meditaiton, Food and Swadhyayam",
      score: { value: 6.4, text: "", ratings: 351 },
      price: { value: 10541, nights: 26, total: 274070 },
      image: mainlogo,
      popularChoice: true,
      noOfAvailableRooms: 15
    },
  ];

  return (
    <div className="room-search-results max-w-7xl mx-auto p-4 font-sans">
      <MenuBar /> {/* Use MenuBar here */}
      <div className="room-search-results__content flex">
        <div className="room-search-results__list w-2/3 pr-4">
          <div className="room-search-results__header flex justify-between items-center mb-4">
            <div className="room-search-results__stats text-sm text-gray-600">
              We Found {"4"} Available Room types
            </div>
          </div>

          {rooms.map((room) => (
            <div
              key={room.id}
              className="room-card bg-white rounded-lg shadow-md p-4 mb-4 flex"
            >
              <div className="room-card__image-container relative w-1/3 mr-4">
                <div className="relative">
                  <img
                    src={room.image}
                    alt={room.name}
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
                      {room.name}
                    </h2>
                  </div>
                  <p className="room-card__description text-sm text-gray-600 mt-1">
                    {room.description}
                  </p>
                </div>

                <div className="room-card__booking text-right">
                  {/* <button onClick={registerHandler} className="room-card__view-deal bg-green-600 text-white px-4 py-2 rounded mt-2 flex items-center register">
                    Registration
                  </button> */}
                  <button onClick={() => handleRoomSelect(room)} className="room-card__view-deal bg-green-600 text-white px-4 py-2 rounded mt-2 flex items-center">
                    Room Booking
                    <ChevronRight className="room-card__view-deal-icon w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <RoomSelection selectedRoom={selectedRoom}/>
      </div>
      {openModal && <ConfirmModal handleClose={handleClose} />}
    </div>
  );
};
export default RoomBook;
