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
    maintanancecost: '',
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
    const files = Array.from(e.target.files).slice(0, 5); // Limit to 5
    setMultipleImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    payload.append('startdate', new Date(formData.startdate).toISOString());
    payload.append('enddate', new Date(formData.enddate).toISOString());

    if (singleImage) {
      payload.append('image', singleImage);
    }

    multipleImages.forEach((file) => {
      payload.append('multipleimage', file); // backend should handle array
    });

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/addbooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.status === 201) {
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
          maintanancecost: '',
        });
        setSingleImage(null);
        setMultipleImages([]);
        setTimeout(() => navigate("/admin"), 3000);
      } else {
        console.error(result);
      }
    } catch (error) {
      console.error(error);
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
          <input type="text" name="maintanancecost" placeholder="Maintenance Cost" value={formData.maintanancecost} onChange={handleChange} />
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
          <label>Upload Images:</label>
          <input type="file" accept="image/*" multiple onChange={handleMultipleImageChange} />
          <p style={{ fontSize: '12px' }}>Max 5 images allowed</p>
        </div>

        <button type="submit" className="submit-btn">Add Room</button>
      </form>
    </div>
  );
};

export default AddBooking;