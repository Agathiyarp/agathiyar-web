import React, { useState } from 'react';
import './blockrooms.css';
import MenuBar from "../../menumain/menubar";

const BlockRooms = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    note: '',
    enable: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/addschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, createdDate: new Date().toISOString() }),
      });

      const result = await res.text();
      if (res.ok) {
        alert('Schedule created successfully!');
        setFormData({ startDate: '', endDate: '', note: '', enable: '' });
      } else {
        alert('Error: ' + result);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error occurred.');
    }
  };

  return (
    <div className="schedule-form-container">
      <MenuBar />
      <h2>Add Room Schedule</h2>
      <form onSubmit={handleSubmit} className="schedule-form">
        <div className="row">
          <label>Start Date:</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} min={getTodayDate()} required />
        </div>

        <div className="row">
          <label>End Date:</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || getTodayDate()} required />
        </div>

        <div className="row">
          <label>Note:</label>
          <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Enter warning note" />
        </div>

        <div className="row">
          <label>Enable:</label>
          <select name="enable" value={formData.enable} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default BlockRooms;
