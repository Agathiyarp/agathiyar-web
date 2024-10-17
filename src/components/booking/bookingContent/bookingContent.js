import React, { useState } from "react"; // Ensure useState is imported
import { ChevronRight } from "lucide-react";
import MenuBar from "../../menumain/menubar"; // Import the MenuBar
import Footer from "../../Footer";
import "./bookingContent.css";
import mainlogo from "../../../images/mainlogo.png"; // Adjust the path as necessary
import ConfirmModal from "../confirmModal";
import { useNavigate } from "react-router-dom";
const RoomBook = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [donationAmount, setDonationAmount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const rows = 6;
  const seatsPerRow = 5;
  const seatPrice = 200; // Rs. 200 per seat
  const convenienceFeePercentage = 0.1296; // 12.96%

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const registerHandler = ()=> {
    navigate("/eventregister");
  }
  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const calculateSubtotal = () => {
    return selectedSeats.length * seatPrice;
  };

  const calculateConvenienceFee = () => {
    return Math.round(calculateSubtotal() * convenienceFeePercentage);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateConvenienceFee() + donationAmount;
  };
  const rooms = [
    {
      id: 1,
      name: "Spritual wisdom",
      type: "Rooms",
      description:
        "Travel Desk and Recreation, International Cuisine at Rangoli",
      score: { value: 8.3, text: "Very good", ratings: 775 },
      price: { value: 17532, nights: 26, total: 455825 },
      image: mainlogo,
    },
    {
      id: 2,
      name: "Half Moon Homestay",
      type: "Entire House / Apartment",
      description:
        "Travel Desk and Recreation, International Cuisine at Rangoli",
      score: { value: 5.5, text: "", ratings: 6 },
      price: { value: 23320, nights: 26, total: 606314 },
      image: mainlogo,
    },
    {
      id: 3,
      name: "room Ashlesh",
      type: "Rooms",
      description:
        "Travel Desk and Recreation, International Cuisine at Rangoli",
      score: { value: 6.4, text: "", ratings: 351 },
      price: { value: 10541, nights: 26, total: 274070 },
      image: mainlogo,
      popularChoice: true,
    },
  ];

  return (
    <div className="room-search-results max-w-7xl mx-auto p-4 font-sans">
      <MenuBar /> {/* Use MenuBar here */}
      <div className="room-search-results__content flex">
        <div className="room-search-results__list w-2/3 pr-4">
          <div className="room-search-results__header flex justify-between items-center mb-4">
            <div className="room-search-results__stats text-sm text-gray-600">
              We Found Total Available Rooms: {"25"}
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
                  1 / {room.id === 2 ? 3 : room.id === 3 ? 52 : 70}
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
                  <button className="room-card__view-deal bg-green-600 text-white px-4 py-2 rounded mt-2 flex items-center">
                    Room Booking
                    <ChevronRight className="room-card__view-deal-icon w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="room-search-results__map w-1/3">
          <div className="room-search-results__map-container bg-gray-200 h-full rounded-lg relative">
            <div className="room-search-results__map-placeholder h-full flex items-center justify-center text-gray-500">
              <div className="max-w-4xl mx-auto p-4 font-sans flex flex-col md:flex-row">
                <div className="w-full md:w-2/3 pr-4">
                  <h3 className="text-2xl font-bold mb-4">Select Your Rooms</h3>
                  <div className="mb-4 booking-rows">
                    {Array.from({ length: rows * seatsPerRow }, (_, index) => {
                      const seatNumber = index + 1;
                      return (
                        <>
                          <button
                            key={seatNumber}
                            className={`p-2 text-xs border rounded ${
                              selectedSeats.includes(seatNumber)
                                ? "bg-green-500 text-white"
                                : "bg-white text-green-500 border-green-500"
                            }`}
                            onClick={() => toggleSeat(seatNumber)}
                          >
                            {seatNumber}
                          </button>
                          {/* Add a break after every 5th seat */}
                          {seatNumber % 10 === 0 && <br />}
                        </>
                      );
                    })}
                  </div>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-xl font-bold mb-4">BOOKING SUMMARY</h3>
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span>UserId: </span>
                        <span>{"test1"}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>UserName: </span>
                        <span>{"test2"}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Destination: </span>
                        <span>{"Agathiyar Bhavan"}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span>CheckIn: </span>
                        <span>{"10/11/2023"}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span>CheckOut: </span>
                        <span>{"12/11/2023"}</span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        Room type: {"A/C"} ({selectedSeats.length} Rooms)
                      </div>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span>Convenience fees: </span>
                      <span>Rs. {calculateConvenienceFee().toFixed(2)}</span>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg mb-4">
                      <div className="flex justify-between font-semibold">
                        <span>Amount Payable: </span>
                        <span>Rs. {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleOpen}
                      className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold"
                    >
                      Proceed
                    </button>
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      If you are not confirming the selected room the booking
                      will be cancelled after 1 hour
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {openModal && <ConfirmModal handleClose={handleClose} />}
      <Footer />
    </div>
  );
};
export default RoomBook;
