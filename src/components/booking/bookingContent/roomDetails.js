import React, { useState } from "react";
import moment from "moment";
import { useLocation } from "react-router-dom";
import "./roomDetails.css";
import MenuBar from "../../menumain/menubar";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import OpacityIcon from "@mui/icons-material/Opacity"; // Hot Water
import ElevatorIcon from "@mui/icons-material/Elevator"; // Lift
import RestaurantIcon from "@mui/icons-material/Restaurant"; // Food Facility
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // Parking
import LocalDrinkIcon from "@mui/icons-material/LocalDrink"; // Drinking Water
import WcIcon from "@mui/icons-material/Wc"; // Attached Toilet
import ConfirmModal from "../confirmModal";
import { ToastContainer } from "react-toastify";
import ImagePreview from "./imagepreview";

const RoomDetails = () => {
  const baseUrl = "https://www.agathiyarpyramid.org/";
  const [openModal, setOpenModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const location = useLocation();
  const { room, checkIn, checkOut, validDays } = location.state; // Retrieve the passed room data
  const multipleimage = room?.multipleimage ? room?.multipleimage : [];

  const [galleryImages] = useState(
    multipleimage
      ? multipleimage.map((img) =>
          img.startsWith("http") ? img : `${baseUrl}${img}`
        )
      : []
  );
  const numberOfDays = moment(checkOut).diff(moment(checkIn), "days");
  const mainImage = `${galleryImages[0]}`;
  const sideImages = galleryImages.slice(1, 3);
  console.log(mainImage, sideImages, "gallery");

  const userInfo = sessionStorage.getItem("userDetails");
  const userDetails = userInfo ? JSON.parse(userInfo) : "";

  const userType = userDetails?.usertype?.trim().toLowerCase() || "";

  const perBedCost = parseInt(room?.extrabedcost, 10) || 0;

  // const maintanance = parseInt(room.maintenancecost, 10) || 0;

  const amenities = [
    {
      text: `Check-In: ${moment(checkIn).format("YYYY-MM-DD")}`,
      icon: (
        <EventIcon
          fontSize="small"
          className="text-gray-600 align-middle pr-1"
        />
      ),
    },
    {
      text: `Check-Out: ${moment(checkOut).format("YYYY-MM-DD")}`,
      icon: (
        <EventIcon
          fontSize="small"
          className="text-gray-600 align-middle pr-1"
        />
      ),
    },
    {
      text: "Hot Water",
      icon: <OpacityIcon fontSize="small" className="text-gray-600 mr-2" />,
    },
    {
      text: "Maintenance",
      icon: <ElevatorIcon fontSize="small" className="text-gray-600 mr-2" />,
    },
    {
      text: "Food Facility",
      icon: <RestaurantIcon fontSize="small" className="text-gray-600 mr-2" />,
    },
    {
      text: "Parking",
      icon: (
        <DirectionsCarIcon fontSize="small" className="text-gray-600 mr-2" />
      ),
    },
    {
      text: "Drinking Water",
      icon: <LocalDrinkIcon fontSize="small" className="text-gray-600 mr-2" />,
    },
    {
      text: "Attached Toilet",
      icon: <WcIcon fontSize="small" className="text-gray-600 mr-2" />,
    },
  ];

  const initialData = [
    {
      name: "Family Room",
      inclusion: room.roomdescription,
      additionalBeds: 0,
      price: 0, // Initialize to 0 since no rooms selected initially
      maintenance: 0, // Initialize to 0 since no rooms selected initially
      rooms: 1, // Default to 1 room
      basePrice:
        userType && userType !== "user"
          ? parseInt(room.sponsoruserroomcost, 10)
          : parseInt(room.normaluserroomcost, 10),
      baseMaintenance:
        userType && userType !== "user"
          ? parseInt(room.sponsorusermaintenancecost, 10)
          : parseInt(room.normalusermaintenancecost, 10),
      extrabedcost: room.extrabedcost,
      roomvariation: room.roomvariation,
    },
  ];

  const [data, setData] = useState(() => {
    // Initialize with proper calculations
    const initializedData = [...initialData];
    console.log(initialData, "testv1");
    initializedData[0].price =
      initializedData[0].rooms * initializedData[0].basePrice;
    initializedData[0].maintenance =
      initializedData[0].rooms * initializedData[0].baseMaintenance;
    return initializedData;
  });

  // Calculate totals at component level
  const totalRooms = data.reduce((sum, item) => sum + item.rooms, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.price, 0);
  const totalMaintenanceCost = data.reduce(
    (sum, item) => sum + item.maintenance,
    0
  );
  const totalBeds = data.reduce((sum, item) => sum + item.additionalBeds, 0);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleRoomBooking = () => {
    handleOpen();
  };

  const handleRoomChange = (index, value) => {
    const updatedData = [...data];
    const rooms = parseInt(value, 10) || 0;
    updatedData[index].rooms = rooms;
    // Use base prices instead of current prices
    updatedData[index].price =
      rooms * updatedData[index].basePrice +
      updatedData[index].additionalBeds * updatedData[index].extrabedcost;
    updatedData[index].maintenance = rooms * updatedData[index].baseMaintenance;

    setData(updatedData);
  };

  const handleAddBed = (index) => {
    setData((prevData) =>
      prevData.map((item, i) =>
        i === index
          ? {
              ...item,
              additionalBeds: item.additionalBeds + 1,
              price:
                item.rooms * item.basePrice +
                (item.additionalBeds + 1) * perBedCost,
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
              price:
                item.rooms * item.basePrice +
                (item.additionalBeds - 1) * perBedCost,
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
              <th>Price in Rs</th>
              <th>Maintenance Cost in Rs</th>
              {room.roomname === "Patriji Bhavan" && <th>Additional beds</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.roomvariation}</td>
                <td>{item.inclusion}</td>
                <td>
                  <select
                    className="select-dropdown"
                    value={item.rooms}
                    onChange={(e) => handleRoomChange(index, e.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </td>
                <td>{item.price}</td>
                <td>{item.maintenance}</td>
                {room.roomname === "Patriji Bhavan" && (
                  <td className="bed-control">
                    <span>
                      Qty: {item.additionalBeds}{" "}
                      <button
                        className="add-bed-btn"
                        onClick={() => handleAddBed(index)}
                        disabled={item.additionalBeds >= 1}
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
                    </span>
                    <span className="max-bed">(Max 1 bed)</span>
                  </td>
                )}
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
        <h1 className="title">
          {" "}
          <LocationOnIcon fontSize="large" className="text-gray-600 mr-2" />
          {room.roomname}
        </h1>
        <div className="gallery">
          <div className="gallery-main">
            <div
              className="card"
              onClick={() => setPreviewOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <img src={mainImage} alt="Main room view" />
            </div>
          </div>
          <div className="gallery-grid1">
            {sideImages.map((src, index) => (
              <div
                key={index}
                className="card"
                onClick={() => setPreviewOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <img src={src} alt={`Room view ${index + 1}`} />
              </div>
            ))}
            <div
              className="card see-all"
              onClick={() => setPreviewOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <img
                className="see-all-image"
                src={galleryImages[0]}
                alt="See all"
              />
              <div className="overlay">
                <p style={{ color: "#fff" }}>See All</p>
              </div>
            </div>
          </div>
        </div>
        {previewOpen && (
          <ImagePreview
            images={galleryImages}
            onClose={() => setPreviewOpen(false)}
          />
        )}
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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
        />
        {openModal && (
          <ConfirmModal
            handleClose={handleClose}
            roomDetails={room}
            startDate={checkIn}
            endDate={checkOut}
            roomsSelected={totalRooms}
            roomcost={room.roomcost}
            maintanancecost={totalMaintenanceCost}
            totalamount={totalAmount}
            bedsSelected={totalBeds}
            days={numberOfDays}
            validDays={validDays}
          />
        )}
      </div>
    </div>
  );
};

export default RoomDetails;