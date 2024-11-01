import React, { useState } from "react"; // Ensure useState is imported
import "./bookingContent.css";
import ConfirmModal from "../confirmModal";
import { TextField, MenuItem } from "@mui/material";
const RoomSelection = ({ selectedRoom, searchData }) => {
  const [noOfRooms, setNoOfRooms] = useState(1);
  const [roomTypeSelected, setRoomTypeSelected] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const roomPrice = selectedRoom?.roomcost;
  const noOfDays = searchData?.noOfDays;
  const maintenanceCharge = selectedRoom?.maintanancecost;
  const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
  const userName = userDetails?.username;
  const MemberId = userDetails?.usermemberid;
  
  var rooms = [1];
  var roomType = ['A/C', 'Non A/C']
  const noOfAvailableRooms = selectedRoom?.totalrooms;

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const calculateRoomCost = () => {
    return noOfRooms * noOfDays * roomPrice;
  };

  const calculateMaintenance = ()=> {
    return maintenanceCharge * noOfDays
  }

  const calculateTotal = () => {
    return calculateRoomCost() + calculateMaintenance();
  };



  const formatDate = (date) => {
    if (date?.$d instanceof Date && !isNaN(date?.$d)) {
      return date?.$d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
    return "Nil";
  };

  return (
    <div className="room-search-results__map w-1-4">
      <div className="room-search-results__map-container bg-gray-200 h-full rounded-lg relative">
        <div className="room-search-results__map-placeholder h-full flex items-center justify-center text-gray-500">
          <div className="max-w-4xl mx-auto p-4 font-sans flex flex-col md:flex-row">
            <div className="w-full md:w-3/4 pr-4 border-room m-p-10">
              <h5>{selectedRoom.destination} - {selectedRoom.roomtype} {`[${selectedRoom.roomvariation}]`}</h5>
              <h5>
                Available Rooms: {noOfAvailableRooms}
              </h5>
              <TextField
                select
                label="Select No of Rooms"
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
              <TextField
                select
                label="Select Room Type"
                value={roomTypeSelected}
                onChange={(e) => setRoomTypeSelected(e.target.value)}
                sx={{ minWidth: 150, marginLeft: 5 }}
              >
                {roomType.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="w-full md:w-1/4 border-room">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-xl font-bold mb-4">BOOKING SUMMARY</h4>
                <div className="mb-4 align-center-booking">
                  <div className="flex justify-between mb-2">
                    <span>MemberId: </span>
                    <span>{MemberId}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>UserName: </span>
                    <span>{userName}</span>
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
                    Type: {selectedRoom?.roomvariation}
                  </div>
                  <div className="flex justify-between mb-4">
                    <span>Room Cost: </span>
                    <span>Rs. {calculateRoomCost()}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span>Maintenance: </span>
                    <span>Rs. {calculateMaintenance()}</span>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg mb-4">
                    <div className="flex justify-between font-semibold">
                      <span>Amount Payable: </span>
                      <span>Rs. {calculateTotal()}</span>
                    </div>
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
          user={userName}
          roomDetails={{
            id: "TypeA-1", 
            type: "TypeA"
          }}
          handleClose={handleClose}
        />
      )}
    </div>
  );
};
export default RoomSelection;
