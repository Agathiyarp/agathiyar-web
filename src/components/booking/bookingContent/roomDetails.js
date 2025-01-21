import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import './roomDetails.css';
import MenuBar from "../../menumain/menubar";
import image1 from "../../../images/image1.png";
import image2 from "../../../images/image2.png";
import image3 from "../../../images/image3.png";

const RoomDetails = () => {
  const location = useLocation();
  const { room } = location.state; // Retrieve the passed room data

  const mainImage = image1;
  const sideImages = [image2, image3];
  const amenities = [
    { text: "Check-In: 10:00 AM" },
    { text: "Check-Out: 09:00 AM" },
    { text: "Hot Water" },
    { text: "Lift" },
    { text: "Food Facility: No" },
    { text: "Parking: No" },
    { text: "Drinking Water" },
    { text: "Attached Toilet" },
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

  const handleRoomBooking = ()=> {};

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
        <h1 className="title">{room.destination}</h1>
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
      </div>
    </div>
  );
};

export default RoomDetails;
