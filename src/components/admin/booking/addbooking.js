import React, { useState } from 'react';
import './addbooking.css';
import { useNavigate } from 'react-router-dom';
import MenuBar from "../../menumain/menubar";

const AddBooking = () => {
  const [formData, setFormData] = useState({
    roomname: '',
    singleoccupy: '',
    roomdescription: '',
    roomtype: '',
    availabletotalrooms: '',
    roomvariation: '',
    sponsoruserroomcost: '',
    normaluserroomcost: '',
    normalusermaintenancecost: '',
    sponsorusermaintenancecost: '',
    maxroomallowed: '',
    extrabed: '',
    extrabedcost: '',
    userroomlimit: '',
    maintenancealert: ''
  });

  const [singleImage, setSingleImage] = useState(null);
  const [multipleImages, setMultipleImages] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleImageChange = (e) => {
    setSingleImage(e.target.files[0]);
  };

  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('You can upload a maximum of 5 images.');
      e.target.value = ''; // Clear the file input
      setMultipleImages([]);
      return;
    }
    setMultipleImages(files);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    payload.append('createddate', new Date().toISOString());

    if (singleImage) {
      payload.append('image', singleImage);
    }

    multipleImages.forEach((file) => {
      payload.append('multipleimage', file);
    });

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/addbooking', {
        method: 'POST',
        body: payload,
      });

      const resultText = await res.text();

      if (res.status === 201) {
        setFormData({
          roomname: '',
          singleoccupy: '',
          roomdescription: '',
          roomtype: '',
          availabletotalrooms: '',
          roomvariation: '',
          sponsoruserroomcost: '',
          normaluserroomcost: '',
          normalusermaintenancecost: '',
          sponsorusermaintenancecost: '',
          maxroomallowed: '',
          extrabed: '',
          extrabedcost: '',
          userroomlimit: '',
          maintenancealert: ''
        });
        setSingleImage(null);
        setMultipleImages([]);
        alert('Romm added successfully!');
        setLoading(false);
        setTimeout(() => navigate("/admin"), 3000);
      } else if (res.status === 409) {
        alert('Booking already exists for the specified date range');
        setLoading(false);
      } else {
        console.error('Server responded with error:', resultText);
        alert('Failed to submit: ' + resultText);
        setLoading(false);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error occurred. See console for details.');
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <MenuBar />
      <h2>Add New Room</h2>
      {loading && <div className="loader">Submitting...</div>}
      <form onSubmit={handleSubmit} className="booking-form" encType="multipart/form-data">
        <div className="row">
          <input type="text" name="roomname" placeholder="Room Name" value={formData.roomname} onChange={handleChange} required />
          <input type="text" name="roomtype" placeholder="Room Type" value={formData.roomtype} onChange={handleChange} required />
        </div>

        <div className="row">
          <input type="text" name="availabletotalrooms" placeholder="Total Rooms" value={formData.availabletotalrooms} onChange={handleChange} required />
          <input type="text" name="roomvariation" placeholder="Room Variation" value={formData.roomvariation} onChange={handleChange} />
        </div>

        <div className="row">
          <input type="text" name="normaluserroomcost" placeholder="Room Cost (Normal User)" value={formData.normaluserroomcost} onChange={handleChange} />
          <input type="text" name="sponsoruserroomcost" placeholder="Room Cost (Sponsor User)" value={formData.sponsoruserroomcost} onChange={handleChange} />
        </div>

        <div className="row">
          <input type="text" name="normalusermaintenancecost" placeholder="Maintenance Cost (Normal User)" value={formData.normalusermaintenancecost} onChange={handleChange} />
          <input type="text" name="sponsorusermaintenancecost" placeholder="Maintenance Cost (Sponsor User)" value={formData.sponsorusermaintenancecost} onChange={handleChange} />
        </div>

        <div className="row">
          <select name="singleoccupy" value={formData.singleoccupy} onChange={handleChange}>
            <option value="">Single Occupy</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <input type="text" name="maxroomallowed" placeholder="Max Rooms Allowed Days" value={formData.maxroomallowed} onChange={handleChange} />
        </div>

        <div className="row">
          <select name="extrabed" value={formData.extrabed} onChange={handleChange}>
            <option value="">Extra Bed</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {formData.extrabed.toLowerCase() === 'yes' && (
            <input type="text" name="extrabedcost" placeholder="Extra Bed Cost" value={formData.extrabedcost} onChange={handleChange} />
          )}
          <input
            type="text"
            name="userroomlimit"
            placeholder="User Room Booking Limit"
            value={formData.userroomlimit}
            onChange={handleChange}
          />
        </div>
        <div className="row">
          <textarea
            name="maintenancealert"
            placeholder="Maintenance Alert Message (if any)"
            value={formData.maintenancealert}
            onChange={handleChange}
          ></textarea>
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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Room'}
        </button>
      </form>
    </div>
  );
};

export default AddBooking;
