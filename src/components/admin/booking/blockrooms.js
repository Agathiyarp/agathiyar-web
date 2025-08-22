import React, { useState, useEffect } from 'react';
import './blockrooms.css';
import MenuBar from "../../menumain/menubar";
import { formatDate } from '../../common/utils';

const BlockRooms = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    enable: '',
  });

  const [schedules, setSchedules] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [originalRowData, setOriginalRowData] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/getschedules');
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
    }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleDelete = async (schedule) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the schedule from ${schedule.startDate} to ${schedule.endDate}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/deleteschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schedule._id }), // adjust field name if needed
      });
      const result = await res.text();
      if (res.ok) {
        alert('Schedule deleted successfully!');
        fetchSchedules();
      } else {
        alert('Delete failed: ' + result);
      }
    } catch (err) {
      alert('Delete failed due to network error');
    }
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
        setFormData({ startDate: '', endDate: '', enable: '' });
        fetchSchedules();
      } else {
        alert('Error: ' + result);
      }
    } catch (err) {
      alert('Network error occurred.');
    }
  };

  const handleEditChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...schedules];
    updated[index][name] = value;
    setSchedules(updated);
  };

  const handleEdit = (index) => {
    setOriginalRowData({ ...schedules[index] });
    setEditingIndex(index);
  };

  const handleCancel = () => {
    const updated = [...schedules];
    updated[editingIndex] = originalRowData;
    setSchedules(updated);
    setEditingIndex(null);
    setOriginalRowData(null);
  };

  const handleUpdate = async (schedule) => {
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/updateschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      const result = await res.text();
      if (res.ok) {
        alert('Schedule updated successfully!');
        setEditingIndex(null);
        setOriginalRowData(null);
        fetchSchedules();
      } else {
        alert('Update failed: ' + result);
      }
    } catch (err) {
      alert('Update failed due to network error');
    }
  };

  return (
    <div className="schedule-form-container">
      <MenuBar />
      <h2>Block Room Schedule</h2>

      {/* Add New Schedule Form */}
      <form onSubmit={handleSubmit} className="schedule-form">
        <div className="row">
          <label>Start Date</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} min={getTodayDate()} required />
        </div>
        <div className="row">
          <label>End Date</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || getTodayDate()} required />
        </div>
        <div className="row">
          <label>Enable</label>
          <select name="enable" value={formData.enable} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button type="submit" className="submit-btn">Add Schedule</button>
      </form>

      {/* Schedule Table */}
      <h3 style={{marginTop: '20px', color: '#4caf50', fontSize: '24px'}}>Existing Schedules</h3>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Enable</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schedules?.map((sch, index) => (
            <tr key={index}>
              <td>
                {editingIndex === index ? (
                  <input
                    type="date"
                    name="startDate"
                    value={sch.startDate}
                    onChange={(e) => handleEditChange(e, index)}
                  />
                ) : (
                  formatDate(sch.startDate)
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <input
                    type="date"
                    name="endDate"
                    value={sch.endDate}
                    onChange={(e) => handleEditChange(e, index)}
                  />
                ) : (
                  formatDate(sch.endDate)
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <select name="enable" value={sch.enable} onChange={(e) => handleEditChange(e, index)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                ) : (
                  sch.enable
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <>
                    <button className="btn-ctrl" onClick={() => handleUpdate(sch)}>Save</button>{' '}
                    <button className="btn-ctrl" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn-ctrl" onClick={() => handleEdit(index)}>Edit</button>{' '}
                    <button className="btn-ctrl" onClick={() => handleDelete(sch)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlockRooms;
