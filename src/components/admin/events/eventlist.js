import React, { useState } from 'react';
import './eventlist.css';
import MenuBar from "../../menumain/menubar";

const EventList = () => {
  const [events, setEvents] = useState([
    { id: 1, name: 'Music Festival', place: 'Central Park' },
    { id: 2, name: 'Art Expo', place: 'Gallery Hall' },
    { id: 3, name: 'Tech Conference', place: 'Convention Center' },
  ]);

  const handleDelete = (id) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
  };

  return (
    <div className="event-container">
      <MenuBar/>
      <h2 className="event-heading">Event List</h2>
      {events.length === 0 ? (
        <p className="no-events">No events available.</p>
      ) : (
        <ul className="event-list">
          {events.map(event => (
            <li key={event.id} className="event-item">
              <div className="event-details">
                <span className="event-name">{event.name}</span>
                <span className="event-place">{event.place}</span>
              </div>
              <button className="delete-button" onClick={() => handleDelete(event.id)}>
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
