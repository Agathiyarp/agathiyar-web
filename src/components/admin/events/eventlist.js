import React, { useState, useEffect } from 'react';
import './eventlist.css';
import MenuBar from "../../menumain/menubar";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://agathiyarpyramid.org/api/get-events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const res = await fetch(`https://agathiyarpyramid.org/api/delete-event/${eventToDelete.eventid}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert('Could not delete the event. Please try again.');
    } finally {
      setShowModal(false);
      setEventToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEventToDelete(null);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="event-container">
      <MenuBar />
      <h2 className="event-heading">Event List</h2>

      {loading ? (
        <p className="loading">Loading events...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : events.length === 0 ? (
        <p className="no-events">No events available.</p>
      ) : (
        <ul className="event-list">
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <div className="event-details">
                <span className="event-name">{event.eventname}</span>
                <span className="event-place">{event.destination}</span>
              </div>
              <button className="delete-button" onClick={() => confirmDelete(event)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Are you sure you want to delete the event?</p>
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

export default EventList;
