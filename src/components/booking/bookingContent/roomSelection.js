import React, { useState } from "react"; // Ensure useState is imported
import "./bookingContent.css";
import ConfirmModal from "../confirmModal";
import { TextField, MenuItem } from "@mui/material";
const RoomSelection = ({ selectedRoom, searchData }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [donationAmount, setDonationAmount] = useState(0);
  const [noOfRooms, setNoOfRooms] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const seatPrice = 200; // Rs. 200 per seat
  const convenienceFeePercentage = 0.1296; // 12.96%

  var rooms = [1,2,3];
  // for (let i = 1; i <= 20; i++) {
  //   rooms.push(i);
  // }

  const noOfAvailableRooms = selectedRoom?.noOfAvailableRooms;

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const calculateSubtotal = () => {
    return noOfRooms * seatPrice;
  };

  const calculateConvenienceFee = () => {
    return Math.round(calculateSubtotal() * convenienceFeePercentage);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateConvenienceFee() + donationAmount;
  };

  const formatDate = (date) => {
    if (date?.$d instanceof Date && !isNaN(date?.$d)) {
      return date?.$d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
    return "Invalid Date";
  };

  return (
    <div className="room-search-results__map w-1-4">
      <div className="room-search-results__map-container bg-gray-200 h-full rounded-lg relative">
        <div className="room-search-results__map-placeholder h-full flex items-center justify-center text-gray-500">
          <div className="max-w-4xl mx-auto p-4 font-sans flex flex-col md:flex-row">
            <div className="w-full md:w-3/4 pr-4 border-room m-p-10">
              <h3 className="text-2xl font-bold mb-4">Select Rooms</h3>
              <TextField
                select
                label="No of Rooms"
                value={noOfRooms}
                onChange={(e) => setNoOfRooms(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                {rooms.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="w-full md:w-1/4 border-room">
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
                    <span>{searchData?.destination}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span>CheckIn: </span>
                    <span>{formatDate(searchData?.checkInDate)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span>CheckOut: </span>
                    <span>{formatDate(searchData?.checkOutDate)}</span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    Type: {selectedRoom?.name}
                  </div>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Maintenance fees: </span>
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
                  If you are not confirming the selected room the booking will
                  be cancelled after 1 hour
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {openModal && (
        <ConfirmModal
          user={"manoj"}
          roomDetails={{
            id: "TypeA-1", // Replace with your room ID logic
            type: "TypeA", // Room type from selectedRoom
          }}
          handleClose={handleClose}
        />
      )}
    </div>
  );
};
export default RoomSelection;
