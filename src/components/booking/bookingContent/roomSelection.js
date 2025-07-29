import React, { useState } from "react"; // Ensure useState is imported
import "./bookingContent.css";
import ConfirmModal from "../confirmModal";
import { TextField, MenuItem } from "@mui/material";
const RoomSelection = ({ selectedRoom, searchData }) => {
  const formatDateYYYYMMDD = (date) => {
    const today = date ? new Date(date) : new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [noOfRooms, setNoOfRooms] = useState(1);
  const [noOfBeds, setNoOfBeds] = useState(1);
  const [noOfGuests, setNoOfGuests] = useState(1);
  const [checkinDate, setCheckinDate] = useState(searchData.checkInDate ? formatDateYYYYMMDD(searchData.checkInDate) : formatDateYYYYMMDD());
  const [checkoutDate, setCheckoutDate] = useState(searchData.checkOutDate ? formatDateYYYYMMDD(searchData.checkOutDate) : formatDateYYYYMMDD());
  const [openModal, setOpenModal] = useState(false);
  const roomPrice = selectedRoom?.roomcost;
  const noOfDays = searchData?.noOfDays;
  const maintenanceCharge = selectedRoom?.maintanancecost;
  const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
  const userName = userDetails?.username;
  const MemberId = userDetails?.usermemberid;
  
  var rooms = [];
  var beds = [];
  var guests = []
  const noOfAvailableRooms = selectedRoom?.totalrooms;
  const noOfAvailableBeds = 10;

  if(searchData && searchData?.destination === 'Agathiyar Bhavan') {
    rooms = [1, 2];
    guests = [];
    beds = [];
  } else if(searchData && searchData.destination === 'Patriji Bhavan') {
    rooms = [1, 2];
    guests = [1, 2, 3, 4];
    beds = [];
  } else if(searchData && searchData.destination === 'Dormitory') {
    beds = [1];
    guests = [];
  } else {
    rooms = [];
    guests = [];
    beds = [];
  }

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

  const formatDateToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="room-search-results__map w-1-4">
      <div className="room-search-results__map-container bg-gray-200 h-full rounded-lg relative">
        <div className="room-search-results__map-placeholder h-full flex items-center justify-center text-gray-500">
          <div className="max-w-4xl mx-auto p-4 font-sans flex flex-col md:flex-row">
            <div className="w-full md:w-3/4 pr-4 border-room m-p-10">
              <h5>Destination: {searchData.destination}</h5>
              {searchData.destination !== "Dormitory" &&<h5>
                Available Rooms: {noOfAvailableRooms}
              </h5>}
              {searchData.destination === "Dormitory" &&<h5>
                Available Beds: {noOfAvailableBeds}
              </h5>}
              <div className="selction-container">
              {(rooms && rooms.length > 0) && <div>
                <TextField
                  select
                  label="Select No of Rooms"
                  value={noOfRooms}
                  onChange={(e) => setNoOfRooms(e.target.value)}
                  sx={{ minWidth: 150 }}
                  required
                >
                  {rooms.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </div>}
              {(guests && guests.length > 0) && <div>
                <TextField
                  select
                  label="Select No of Guests"
                  value={noOfGuests}
                  onChange={(e) => setNoOfGuests(e.target.value)}
                  sx={{ minWidth: 150 }}
                  required
                >
                  {guests.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </div>}
              </div>
              {(beds && beds.length > 0) && <div>
                <TextField
                  select
                  label="Select No of beds"
                  value={noOfBeds}
                  onChange={(e) => setNoOfBeds(e.target.value)}
                  sx={{ minWidth: 150 }}
                  required
                >
                  {beds.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </div>}
              <div className="selction-container">
                <TextField
                  label="Select Start Date"
                  type="date"
                  value={checkinDate}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  sx={{ minWidth: 150, marginLeft: 0, marginTop: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />

                {/* Check-out Date Field */}
                <TextField
                  label="Select End Date"
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  sx={{ minWidth: 150, marginLeft: 3, marginTop: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </div>
              <div className="notice-text">
                *Select Start Date and End Date which is final booking dates.
              </div>
            </div>
            <div className="w-full md:w-1/4 border-room">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-xl font-bold mb-4">BOOKING SUMMARY</h4>
                <div className="mb-4 align-center-booking">
                  {MemberId && MemberId.length > 0 && <div className="flex justify-between mb-2">
                    <span className="font-bold">MemberId: </span>
                    <span>{MemberId}</span>
                  </div>}
                  {userName && userName.length > 0 && <div className="flex justify-between mb-2">
                    <span className="font-bold">UserName: </span>
                    <span>{userName}</span>
                  </div>}
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">Destination: </span>
                    <span>{searchData?.destination}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold">Start Date: </span>
                    <span>{checkinDate && formatDateToDDMMYYYY(checkinDate)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold">End Date: </span>
                    <span>{checkoutDate && formatDateToDDMMYYYY(checkoutDate)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold">Selected Rooms:</span>
                    <span>{noOfRooms}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold">Room Cost: </span>
                    <span>Rs. {calculateRoomCost()}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold">Maintenance: </span>
                    <span>Rs. {calculateMaintenance()}</span>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg mb-4">
                    <div className="flex justify-between font-semibold">
                      <span className="font-bold">Amount Payable: </span>
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
          userDetails={userDetails}
          searchData={searchData}
          selectedRoom={selectedRoom}
          checkInDate={checkinDate}
          checkOutDate={checkoutDate}
          handleClose={handleClose}
          roomCost={calculateRoomCost()}
          maintananceCost={calculateMaintenance()}
          totalCost={calculateTotal()}
          totalRooms={noOfRooms}
        />
      )}
    </div>
  );
};
export default RoomSelection;
