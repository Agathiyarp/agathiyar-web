import React, { useState } from 'react';
import './addevent.css';

const AddEvent = () => {
  const [formData, setFormData] = useState({
    eventname: '',
    mastername: '',
    startdate: '',
    enddate: '',
    numberofdays: '',
    eventdescription: '',
    destination: '',
    roomtype: '',
    numberofparticipants: '',
    retreatcost: '',
    reservedeposit: '',
    contactdetails: '',
    imageurl: '',
    language: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/addevent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Event added successfully');
        setFormData({
          eventname: '',
          mastername: '',
          startdate: '',
          enddate: '',
          numberofdays: '',
          eventdescription: '',
          destination: '',
          roomtype: '',
          numberofparticipants: '',
          retreatcost: '',
          reservedeposit: '',
          contactdetails: '',
          imageurl: '',
          language: '',
        });
      } else {
        alert(result.message || 'Failed to add event');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="event-form-container">
      <h2>Add New Event</h2>
      <p className="subtitle">Create and manage your retreat events</p>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="row">
          <input type="text" name="eventname" placeholder="Event Name *" value={formData.eventname} onChange={handleChange} required />
          <input type="text" name="mastername" placeholder="Master Name *" value={formData.mastername} onChange={handleChange} required />
        </div>
        <div className="row">
          <input type="date" name="startdate" placeholder="Start Date *" value={formData.startdate} onChange={handleChange} required />
          <input type="date" name="enddate" placeholder="End Date *" value={formData.enddate} onChange={handleChange} required />
        </div>
        <div className="row">
          <input type="text" name="numberofdays" placeholder="Number of Days" value={formData.numberofdays} onChange={handleChange} />
          <input type="text" name="destination" placeholder="Destination *" value={formData.destination} onChange={handleChange} required />
        </div>
        <div className="row">
          <select name="roomtype" value={formData.roomtype} onChange={handleChange} required>
            <option value="">Select Room Type</option>
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
          </select>
          <input type="text" name="numberofparticipants" placeholder="Number of Participants" value={formData.numberofparticipants} onChange={handleChange} />
        </div>
        <div className="row">
          <input type="text" name="retreatcost" placeholder="Retreat Cost" value={formData.retreatcost} onChange={handleChange} />
          <input type="text" name="reservedeposit" placeholder="Reserve Deposit" value={formData.reservedeposit} onChange={handleChange} />
        </div>
        <div className="row">
          <input type="text" name="imageurl" placeholder="https://example.com/image.jpg" value={formData.imageurl} onChange={handleChange} />
          <select name="language" value={formData.language} onChange={handleChange}>
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
        <textarea name="eventdescription" placeholder="Describe your retreat event..." value={formData.eventdescription} onChange={handleChange}></textarea>
        <textarea name="contactdetails" placeholder="Phone, email, address..." value={formData.contactdetails} onChange={handleChange}></textarea>
        <button type="submit" className="submit-btn">CREATE EVENT</button>
      </form>
    </div>
  );
};

export default AddEvent;