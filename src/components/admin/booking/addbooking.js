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
    image: '',
    multipleimage: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      startdate: new Date(formData.startdate),
      enddate: new Date(formData.enddate),
      multipleimage: formData.multipleimage.split(',').map((url) => url.trim()),
    };

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
          image: '',
          multipleimage: ''
        });
        setTimeout(() => {
          navigate("/admin");
        }, 3000);
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
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="row">
          <input type="text" name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} required />
          <input type="text" name="roomtype" placeholder="Room Type" value={formData.roomtype} onChange={handleChange} required />
        </div>
        <div className="row">
          <input type="date" name="startdate" placeholder="Start Date" value={formData.startdate} onChange={handleChange} required />
          <input type="date" name="enddate" placeholder="End Date" value={formData.enddate} onChange={handleChange} required />
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
          <input type="text" name="image" placeholder="Single Image URL" value={formData.image} onChange={handleChange} />
        </div>
        <textarea name="roomdescription" placeholder="Room Description" value={formData.roomdescription} onChange={handleChange}></textarea>
        <textarea name="multipleimage" placeholder="Multiple Image URLs (comma-separated)" value={formData.multipleimage} onChange={handleChange}></textarea>
        <button type="submit" className="submit-btn">Add Room</button>
      </form>
    </div>
  );
};

export default AddBooking;