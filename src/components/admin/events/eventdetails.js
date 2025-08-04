import React, { useState } from 'react';
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

  const handleFilterByDate = async () => {
    const { start, end } = dateFilter;
    if (!start || !end) return alert("Select both start and end dates");
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/events/filter/' + start + '/' + end);
      const data = await res.json();
      if (res.ok && data[0].data && data[0].data.length > 0) {
        setUserList(data[0]?.data);
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

  const exportToExcel = () => {
    if (!eventDetails.eventId || userList.length === 0) return;

    // Clone userList and append eventId to each record
    const dataToExport = userList.map(user => ({
      ...user,
      eventId: eventDetails.eventId
    }));
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
        <h4>Filter by Date</h4>
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
        <button className="btn-event" onClick={exportToExcel}>Export Excel</button>
      </div>

      {userDetails && (
        <div className="event-details-list">
          <h4>User Details</h4>
          <table>
            <tbody>
              <tr>
                <td><strong>Name</strong></td>
                <td>{userDetails.name || '-'}</td>
              </tr>
              <tr>
                <td><strong>Email</strong></td>
                <td>{userDetails.email || '-'}</td>
              </tr>
              <tr>
                <td><strong>Phone</strong></td>
                <td>{userDetails.phoneNumber || '-'}</td>
              </tr>
              <tr>
                <td><strong>Country</strong></td>
                <td>{userDetails.country || '-'}</td>
              </tr>
              <tr>
                <td><strong>Username</strong></td>
                <td>{userDetails.username || '-'}</td>
              </tr>
              <tr>
                <td><strong>User Member ID</strong></td>
                <td>{userDetails.usermemberid || '-'}</td>
              </tr>
              <tr>
                <td><strong>User Type</strong></td>
                <td>{userDetails.usertype || '-'}</td>
              </tr>
              <tr>
                <td><strong>Address</strong></td>
                <td>{userDetails.address || '-'}</td>
              </tr>
              <tr>
                <td><strong>Date of Birth</strong></td>
                <td>{userDetails.dateofbirth || '-'}</td>
              </tr>
              <tr>
                <td><strong>Gender</strong></td>
                <td>{userDetails.gender || '-'}</td>
              </tr>
               <tr>
                <td><strong>Event ID</strong></td>
                <td>{eventDetails.eventId || '-'}</td>
              </tr>
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
                <th>Event Name</th><th>UserID</th><th>UserName</th><th>Additional Member Count</th><th>Email</th><th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user, i) => (
                <tr key={i}>
                  <td>{eventDetails.name}</td>
                  <td>{eventDetails.memberId}</td>
                  <td>{user.name}</td>
                  <td>{user.memberCount}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
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