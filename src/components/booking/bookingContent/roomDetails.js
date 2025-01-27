import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import './roomDetails.css';
import MenuBar from "../../menumain/menubar";
import image1 from "../../../images/image1.png";
import image2 from "../../../images/image2.png";
import image3 from "../../../images/image3.png";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import OpacityIcon from '@mui/icons-material/Opacity'; // Hot Water
import ElevatorIcon from '@mui/icons-material/Elevator'; // Lift
import RestaurantIcon from '@mui/icons-material/Restaurant'; // Food Facility
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'; // Parking
import LocalDrinkIcon from '@mui/icons-material/LocalDrink'; // Drinking Water
import WcIcon from '@mui/icons-material/Wc'; // Attached Toilet
import ConfirmModal from "../confirmModal";

const RoomDetails = () => {
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();
  const { room } = location.state; // Retrieve the passed room data

  const mainImage = image1;
  const sideImages = [image2, image3];

  const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
  const userName = userDetails?.username;
  const MemberId = userDetails?.usermemberid;
  
  const amenities = [
    { text: "Check-In: 10:00 AM", icon: <EventIcon fontSize="small" className="text-gray-600 align-middle pr-1" /> },
    { text: "Check-Out: 09:00 AM", icon: <EventIcon fontSize="small" className="text-gray-600 align-middle pr-1" /> },
    { text: "Hot Water", icon: <OpacityIcon fontSize="small" className="text-gray-600 mr-2" /> },
    { text: "Lift",  icon: <ElevatorIcon fontSize="small" className="text-gray-600 mr-2" />},
    { text: "Food Facility: No",  icon: <RestaurantIcon fontSize="small" className="text-gray-600 mr-2" />},
    { text: "Parking: No",  icon: <DirectionsCarIcon fontSize="small" className="text-gray-600 mr-2" />},
    { text: "Drinking Water",  icon:  <LocalDrinkIcon fontSize="small" className="text-gray-600 mr-2" />},
    { text: "Attached Toilet",  icon: <WcIcon fontSize="small" className="text-gray-600 mr-2" />},
  ];

  const initialData = [
    {
      name: "2 Bed Deluxe Room",
      inclusion: "Double Bed, Western Attached, Let-Bath, 1st Floor, Toiletries, Wardrobe, Electric kettle, Table-Chair",
      additionalBeds: 0,
      price: 2000,
    },
  ];

  const [data, setData] = useState(initialData);

  
  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  // const calculateRoomCost = () => {
  //   return noOfRooms * noOfDays * roomPrice;
  // };

  // const calculateMaintenance = ()=> {
  //   return maintenanceCharge * noOfDays
  // }

  // const calculateTotal = () => {
  //   return calculateRoomCost() + calculateMaintenance();
  // };


  const handleRoomBooking = ()=> {
    handleOpen();
  };

  const handleRoomChange = (index, value) => {
    const updatedData = [...data];
    updatedData[index].rooms = parseInt(value, 10) || 0; // Ensure it’s a number
    setData(updatedData);
  };

  const handleAddBed = (index) => {
    setData((prevData) =>
      prevData.map((item, i) =>
        i === index
          ? {
              ...item,
              additionalBeds: item.additionalBeds + 1,
              price: item.price + 500,
            }
          : item
      )
    );
  };

  const handleRemoveBed = (index) => {
    setData((prevData) =>
      prevData.map((item, i) =>
        i === index && item.additionalBeds > 0
          ? {
              ...item,
              additionalBeds: item.additionalBeds - 1,
              price: item.price - 500,
            }
          : item
      )
    );
  };

  const TableComponent = ({ data }) => {
    return (
      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Inclusion</th>
              <th>Rooms</th>
              <th>Price</th>
              <th>Maintenance</th>
              <th>Additional beds</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.inclusion}</td>
                <td>
                  <select
                    className="select-dropdown"
                    value={item.rooms}
                    onChange={(e) => handleRoomChange(index, e.target.value)}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </td>
                <td>{item.price}</td>
                <td>{"200"}</td>
                <td>
                  Qty: {item.additionalBeds}{" "}
                  <button
                    className="add-bed-btn"
                    onClick={() => handleAddBed(index)}
                  >
                    +
                  </button>
                  <button
                    className="remove-bed-btn"
                    onClick={() => handleRemoveBed(index)}
                    disabled={item.additionalBeds === 0}
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container-room">
      <MenuBar />
      <div className="main-content">
        <h1 className="title"> <LocationOnIcon fontSize="large" className="text-gray-600 mr-2" />{room.destination}</h1>
        <div className="gallery">
          <div className="gallery-main">
            <div className="card">
              <img src={mainImage} alt="Main room view" />
            </div>
          </div>
          <div className="gallery-grid">
            {sideImages.map((src, index) => (
              <div key={index} className="card">
                <img src={src} alt={`Room view ${index + 1}`} />
              </div>
            ))}
            <div className="card see-all">
              <img className="see-all-image" src={image1} alt="See all" />
              <div className="overlay">
                <div className="overlay-content">
                  <span>+11</span>
                  <p>See All</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-wrapper">
          <div className="info-section">
            <div className="contact-info">
              <div className="info-item">{room.roomdescription}</div>
            </div>
            <div className="amenities">
              {amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  {amenity.icon}
                  <span>{amenity.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
          <button onClick={() => handleRoomBooking()} className="book-room">
            Book this Room
            </button>
           
          </div>
        </div>
        <div>
          <TableComponent data={data} />
        </div>
        {openModal && (
        <ConfirmModal
          userDetails={userDetails}
          // selectedRoom={selectedRoom}
          // checkInDate={checkinDate}
          // checkOutDate={checkoutDate}
          handleClose={handleClose}
          // roomCost={calculateRoomCost()}
          // maintananceCost={calculateMaintenance()}
          // totalCost={calculateTotal()}
        />
      )}
      </div>
    </div>
  );
};

export default RoomDetails;
