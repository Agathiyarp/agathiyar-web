import React, { useState } from 'react';
import './eventdetails.css';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import MenuBar from "../../menumain/menubar";

const EventDetails = () => {
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [userDetails, setUserDetails] = useState(null);
  const [userList, setUserList] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const handleFilterByDate = async () => {
    const { start, end } = dateFilter;
    if (!start || !end) return alert("Select both start and end dates");
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/events/filter/' + start + '/' + end);
      const data = await res.json();
      console.log(data, res, "testv1");
      if (res.ok) {
        setUserList(data);
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
    const ws = XLSX.utils.json_to_sheet(userList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_list.xlsx");
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
            </tbody>
          </table>
        </div>
      )}

      {noResults && (
        <div className="no-results">
          <p>No users found.</p>
        </div>
      )}

      {userList.length > 0 && (
        <div className="user-list">
          <h4>User List</h4>
          <table>
            <thead>
              <tr>
                <th>User ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Event Name</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user, i) => (
                <tr key={i}>
                  <td>{user.usermemberid}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.eventName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="export-buttons">
            <button className="btn-event" onClick={exportToExcel}>Export Excel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;