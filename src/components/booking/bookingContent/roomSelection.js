import React, { useState  } from "react"; // Ensure useState is imported
import "./bookingContent.css";
import ConfirmModal from "../confirmModal";
const RoomSelection = ({selectedRoom}) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [donationAmount, setDonationAmount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const seatPrice = 200; // Rs. 200 per seat
  const convenienceFeePercentage = 0.1296; // 12.96%


  const noOfAvailableRooms = selectedRoom?.noOfAvailableRooms

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

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

  const handleRoomSelection = ()=> {
    
  };

  return (
    <div className="room-search-results__map w-1/3">
          <div className="room-search-results__map-container bg-gray-200 h-full rounded-lg relative">
            <div className="room-search-results__map-placeholder h-full flex items-center justify-center text-gray-500">
              <div className="max-w-4xl mx-auto p-4 font-sans flex flex-col md:flex-row">
                <div className="w-full md:w-2/3 pr-4">
                  <h3 className="text-2xl font-bold mb-4">Select Your Rooms</h3>
                  <div className="mb-4 booking-rows">
                    {Array.from({ length: noOfAvailableRooms }, (_, index) => {
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
                        Type: {selectedRoom?.name}
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
          {openModal && <ConfirmModal handleClose={handleClose} />}
        </div>
  );
};
export default RoomSelection;
