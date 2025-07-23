import React, { useEffect, useState } from 'react';
import './roomlist.css';
import MenuBar from "../../menumain/menubar";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

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

  const confirmDelete = (room) => {
    setRoomToDelete(room);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const res = await fetch(`https://agathiyarpyramid.org/api/deleteBookingRecord/${roomToDelete._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete room record');
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert('Could not delete the room record. Please try again.');
    } finally {
      setShowModal(false);
      setRoomToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setRoomToDelete(null);
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
            <li key={room._id} className="room-item">
              <div className="room-details">
                <span className="room-designation">{room.destination}</span>
                <span className="room-type">{room.roomtype}</span>
              </div>
              <button className="delete-button" onClick={() => confirmDelete(room)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Are you sure you want to delete the room record?</p>
            <div className="modal-actions">
              <button className="confirm-button" onClick={handleDeleteConfirmed}>Yes, Delete</button>
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
