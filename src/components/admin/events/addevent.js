import React, { useState, useEffect } from 'react';
import './addevent.css';
// import { useNavigate } from 'react-router-dom';
import MenuBar from "../../menumain/menubar";

const AddEvent = () => {
  const [formData, setFormData] = useState({
    eventname: '',
    mastername: '',
    startdate: '',
    enddate: '',
    numberofdays: '',
    eventdescription: '',
    place: '',
    numberofparticipants: '',
    retreatcost: '',
    reservedeposit: '',
    contactdetails: '',
    imageurl: '',
    language: '',
  });

  const [events, setEvents] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  // const navigate = useNavigate();
  console.log(events);

  // Fetch all events on mount
  // useEffect(() => {
  //   fetchEvents();
  // }, []);

  // const fetchEvents = async () => {
  //   try {
  //     const res = await fetch('https://www.agathiyarpyramid.org/api/events');
  //     const data = await res.json();
  //     setEvents(data);
  //   } catch (error) {
  //     console.error('Error fetching events:', error);
  //   }
  // };

  // Automatically calculate number of days when start or end date changes
  useEffect(() => {
    if (formData.startdate && formData.enddate) {
      const start = new Date(formData.startdate);
      const end = new Date(formData.enddate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({ ...prev, numberofdays: diffDays.toString() }));
      } else {
        setFormData(prev => ({ ...prev, numberofdays: '' }));
      }
    }
  }, [formData.startdate, formData.enddate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = '';
      if (selectedImage) {
        // Upload the image first
        const formDataImage = new FormData();
        formDataImage.append('image', selectedImage);

        const imageUploadResponse = await fetch('https://www.agathiyarpyramid.org/api/upload-image', {
          method: 'POST',
          body: formDataImage,
        });

        if (!imageUploadResponse.ok) {
          throw new Error('Image upload failed');
        }

        const imageResult = await imageUploadResponse.json();
        imageUrl = imageResult.imageUrl;
      }

      // Add imageUrl to formData
      const eventPayload = {
        ...formData,
        imageurl: imageUrl,
      };

      // Post event
      const response = await fetch('https://www.agathiyarpyramid.org/api/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
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
          place: '',
          numberofparticipants: '',
          retreatcost: '',
          reservedeposit: '',
          contactdetails: '',
          imageurl: '',
          language: '',
        });
        setSelectedImage(null);
        // fetchEvents();
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
      <MenuBar />
      <h2>Add New Event</h2>
      {/* <p className="subtitle">Create and manage your retreat events</p> */}

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
          <input type="text" name="numberofdays" placeholder="Number of Days" value={formData.numberofdays} onChange={handleChange} readOnly />
          <input type="text" name="numberofparticipants" placeholder="Number of Participants" value={formData.numberofparticipants} onChange={handleChange} />
        </div>
        <div className="row">
          <input type="text" name="place" placeholder="Place *" value={formData.place} onChange={handleChange} required />
        </div>
        <div className="row">
          <input type="text" name="retreatcost" placeholder="Retreat Cost" value={formData.retreatcost} onChange={handleChange} />
          <input type="text" name="reservedeposit" placeholder="Reserve Deposit" value={formData.reservedeposit} onChange={handleChange} />
        </div>
        <div className="row">
          <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} required />
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
