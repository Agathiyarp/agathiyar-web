import React, { useState, useEffect } from 'react';
import './eventdetails.css';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import MenuBar from "../../menumain/menubar";

const EventDetails = () => {
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [userDetails, setUserDetails] = useState(null);
  const [userList, setUserList] = useState([]);
  const [eventDetails, setEventDetails] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(''); 
  const [allRegistrations, setAllRegistrations] = useState([]);

  // 🔁 Load all events on page load
  useEffect(() => {
    fetchAllEvents();
    fetchEventsList();
  }, []);

  const fetchEventsList = async () => {
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/get-events');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/eventregistrations');
      const data = await res.json();
      console.log(data, "testv1")
      if (res.ok && data?.length > 0) {
        setUserList(data);
        setEventDetails(data);
        setAllRegistrations(data); 
        setNoResults(false);
      } else {
        setUserList([]);
        setEventDetails([]);
        setAllRegistrations([]);
        setNoResults(true);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching all events');
    }
  };

  const handleFilterByDate = async () => {
    const { start, end } = dateFilter;
    if (!start || !end) return alert("Select both start and end dates");
    try {
      const res = await fetch(`https://www.agathiyarpyramid.org/api/events/filter/${start}/${end}`);
      const data = await res.json();
      if (res.ok && data?.length > 0) {
        setUserList(data);
        setEventDetails(data[0]);
        setUserDetails(null);
        setNoResults(false);
      } else {
        setUserList([]);
        setUserDetails(null);
        setNoResults(true);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching user list');
    }
  };

  const handleEventChange = (e) => {
    const eventName = e.target.value;
    setSelectedEvent(eventName);
    setUserDetails(null);

    if (!eventName) {
      // Show all registrations again
      setUserList(allRegistrations);
      setNoResults(allRegistrations.length === 0);
      return;
    }

    const filtered = allRegistrations.filter(
      (u) =>
        (u.eventname && String(u.eventname).toLowerCase() === eventName.toLowerCase()) ||
        (u.event_name && String(u.event_name).toLowerCase() === eventName.toLowerCase())
    );
    setUserList(filtered);
    setNoResults(filtered.length === 0);
  };

  const exportToExcel = () => {
    if (userList.length === 0) return;
    const dataToExport = userList;

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_list.xlsx");
  };

  return (
    <div className="event-mgmt-container">
      <MenuBar />
      <h2>Events Details</h2>

      <div className="section">
        <h4 style={{marginBottom: '10px', width: '100%'}}>Filter by:</h4>
        <input
          className='input-event'
          type="date"
          value={dateFilter.start}
          onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
        />
        <input
          className='input-event'
          type="date"
          value={dateFilter.end}
          onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
        />
        <button className="btn-event" onClick={handleFilterByDate}>Filter</button>
      </div>
      <div className='section' style={{marginBottom: '10px'}}>
        <h4 style={{color: '#ccc'}}>(OR)</h4>
      </div>
      <div className='section'>
         <h4 style={{marginBottom: '20px'}}>Filter EventName:</h4>
        <select
          className="input-event"
          value={selectedEvent}
          onChange={handleEventChange}
          style={{marginBottom: '10px'}}
        >
          <option value="">All</option>
          {events.map((ev, idx) => {
            // Try to be flexible with API field names:
            const name = ev.eventname || ev.event_name || ev.name || ev.title || '';
            return (
              <option key={idx} value={name}>
                {name || `Event ${idx + 1}`}
              </option>
            );
          })}
        </select>
        <button className="btn-event" onClick={exportToExcel}>Export Excel</button>
      </div>

      {userDetails && (
        <div className="event-details-list">
          <h4>User Details</h4>
          <table>
            <tbody>
              {/* User Details Display */}
              <tr><td><strong>Name</strong></td><td>{userDetails.name || '-'}</td></tr>
              <tr><td><strong>Email</strong></td><td>{userDetails.email || '-'}</td></tr>
              <tr><td><strong>Phone</strong></td><td>{userDetails.phoneNumber || '-'}</td></tr>
              <tr><td><strong>Country</strong></td><td>{userDetails.country || '-'}</td></tr>
              <tr><td><strong>Username</strong></td><td>{userDetails.username || '-'}</td></tr>
              <tr><td><strong>User Member ID</strong></td><td>{userDetails.usermemberid || '-'}</td></tr>
              <tr><td><strong>User Type</strong></td><td>{userDetails.usertype || '-'}</td></tr>
              <tr><td><strong>Address</strong></td><td>{userDetails.address || '-'}</td></tr>
              <tr><td><strong>Date of Birth</strong></td><td>{userDetails.dateofbirth || '-'}</td></tr>
              <tr><td><strong>Gender</strong></td><td>{userDetails.gender || '-'}</td></tr>
              <tr><td><strong>Event ID</strong></td><td>{eventDetails.eventId || '-'}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {noResults && (
        <div className="no-results">
          <p>No users found.</p>
        </div>
      )}

      {userList?.length > 0 && (
        <div className="user-list">
          <table>
            <thead>
              <tr>
                <th>UserID</th><th>Event Name</th><th>Event MasterName</th><th>Start Date</th><th>End Date</th><th>Event Days</th><th>Event Place</th><th>Additional Member Count</th><th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user, i) => (
                <tr key={i}>
                  <td>{user.memberid}</td>
                  <td>{user.eventname}</td>
                  <td>{user.eventmastername}</td>
                  <td>{user.startdate}</td>
                  <td>{user.enddate}</td>
                  <td>{user.eventdays}</td>
                  <td>{user.eventplace}</td>
                  <td>{user.guests}</td>
                  <td>{user.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventDetails;