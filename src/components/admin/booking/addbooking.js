import React, { useState } from 'react';
import './addbooking.css';
import { useNavigate } from 'react-router-dom';
import MenuBar from "../../menumain/menubar";

const AddBooking = () => {
  const [formData, setFormData] = useState({
    destination: '',
    startdate: '',
    enddate: '',
    singleoccupy: '',
    roomdescription: '',
    roomtype: '',
    totalrooms: '',
    roomvariation: '',
    roomcost: '',
    maintenancecost: '', // ✅ Use corrected key
  });

  const [singleImage, setSingleImage] = useState(null);
  const [multipleImages, setMultipleImages] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleImageChange = (e) => {
    setSingleImage(e.target.files[0]);
  };

  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // Max 5 files
    setMultipleImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();

    // Append form fields
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    // Dates: already in yyyy-mm-dd format from <input type="date">
    payload.set('startdate', formData.startdate);
    payload.set('enddate', formData.enddate);

    // Append images
    if (singleImage) {
      payload.append('image', singleImage);
    }

    multipleImages.forEach((file) => {
      payload.append('multipleimage[]', file); // ✅ Use array notation
    });

    // Optional: Debug what’s being sent
    for (let [key, value] of payload.entries()) {
      console.log(key, value);
    }

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/addbooking', {
        method: 'POST',
        body: payload, // Do NOT set Content-Type when using FormData
      });

      const resultText = await res.text(); // Use .text() first for better debugging

      if (res) {
        alert('Booking added successfully!');
        setFormData({
          destination: '',
          startdate: '',
          enddate: '',
          singleoccupy: '',
          roomdescription: '',
          roomtype: '',
          totalrooms: '',
          roomvariation: '',
          roomcost: '',
          maintenancecost: '',
        });
        setSingleImage(null);
        setMultipleImages([]);
        setTimeout(() => navigate("/admin"), 3000);
      } else {
        console.error('Server responded with error:', resultText);
        alert('Failed to submit: ' + resultText);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error occurred. See console for details.');
    }
  };

  return (
    <div className="booking-form-container">
      <MenuBar />
      <h2>Add New Room</h2>
      <form onSubmit={handleSubmit} className="booking-form" encType="multipart/form-data">
        <div className="row">
          <input type="text" name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} required />
          <input type="text" name="roomtype" placeholder="Room Type" value={formData.roomtype} onChange={handleChange} required />
        </div>

        <div className="row">
          <input type="date" name="startdate" value={formData.startdate} onChange={handleChange} required />
          <input type="date" name="enddate" value={formData.enddate} onChange={handleChange} required />
        </div>

        <div className="row">
          <input type="text" name="totalrooms" placeholder="Total Rooms" value={formData.totalrooms} onChange={handleChange} required />
          <input type="text" name="roomvariation" placeholder="Room Variation" value={formData.roomvariation} onChange={handleChange} />
        </div>

        <div className="row">
          <input type="text" name="roomcost" placeholder="Room Cost" value={formData.roomcost} onChange={handleChange} />
          <input type="text" name="maintenancecost" placeholder="Maintenance Cost" value={formData.maintenancecost} onChange={handleChange} />
        </div>

        <div className="row">
          <input type="text" name="singleoccupy" placeholder="Single Occupy (yes/no)" value={formData.singleoccupy} onChange={handleChange} />
        </div>

        <textarea name="roomdescription" placeholder="Room Description" value={formData.roomdescription} onChange={handleChange}></textarea>

        <div className="row">
          <label>Upload Preview Image:</label>
          <input type="file" accept="image/*" onChange={handleSingleImageChange} />
        </div>

        <div className="row">
          <label>Upload Images (Max 5):</label>
          <input type="file" accept="image/*" multiple onChange={handleMultipleImageChange} />
        </div>

        <button type="submit" className="submit-btn">Add Room</button>
      </form>
    </div>
  );
};

export default AddBooking;