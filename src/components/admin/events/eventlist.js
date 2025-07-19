import React, { useState, useEffect } from 'react';
import './eventlist.css';
import MenuBar from "../../menumain/menubar";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`https://agathiyarpyramid.org/api/delete-event/${id}`, {
        method: 'DELETE',
      });
      fetchEvents();
      if (!res.ok) throw new Error('Failed to delete event');
    } catch (err) {
      console.error(err);
      alert('Could not delete the event. Please try again.');
    }
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
              <button className="delete-button" onClick={() => handleDelete(event.eventid)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventList;
