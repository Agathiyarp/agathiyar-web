import React, { useState } from 'react';
import './roomlist.css';
import MenuBar from "../../menumain/menubar";

const RoomList = () => {
  const [rooms, setRooms] = useState([
    { id: 1, roomType: 'Single', designation: 'Agathiyar Bhavan' },
    { id: 2, roomType: 'Double Suite', designation: 'Pathriji Bhavan' },
    { id: 3, roomType: 'Dormitory', designation: 'agathiyar' },
  ]);

  const handleDelete = (id) => {
    const updatedRooms = rooms.filter(room => room.id !== id);
    setRooms(updatedRooms);
  };

  return (
    <div className="room-container">
      <MenuBar />
      <h2 className="room-heading">Room List</h2>
      {rooms.length === 0 ? (
        <p className="no-rooms">No rooms available.</p>
      ) : (
        <ul className="room-list">
          {rooms.map(room => (
            <li key={room.id} className="room-item">
              <div className="room-details">
                <span className="room-type">{room.roomType}</span>
                <span className="room-designation">{room.designation}</span>
              </div>
              <button className="delete-button" onClick={() => handleDelete(room.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomList;
