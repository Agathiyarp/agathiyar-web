import React, { useEffect, useState } from 'react';
import './roomlist.css';
import MenuBar from "../../menumain/menubar";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://agathiyarpyramid.org/api/getBookingRecords');
      if (!res.ok) throw new Error('Failed to fetch room records');
      const data = await res.json();
      setRooms(data || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load room records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`https://agathiyarpyramid.org/api/deleteBookingRecord/${id}`, {
        method: 'DELETE',
      });
      fetchRooms();
      if (!res.ok) throw new Error('Failed to delete room record');
    } catch (err) {
      console.error(err);
      alert('Could not delete the room record. Please try again.');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="room-container">
      <MenuBar />
      <h2 className="room-heading">Room List</h2>

      {loading ? (
        <p className="loading">Loading rooms...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : rooms.length === 0 ? (
        <p className="no-rooms">No rooms available.</p>
      ) : (
        <ul className="room-list">
          {rooms.map((room) => (
            <li key={room.id} className="room-item">
              <div className="room-details">
                <span className="room-designation">{room.destination}</span>
                <span className="room-type">{room.roomtype}</span>
              </div>
              <button className="delete-button" onClick={() => handleDelete(room._id)}>
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
