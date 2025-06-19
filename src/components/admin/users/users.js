import React, { useState } from 'react';
import './users.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const UserManagement = () => {
  const [userId, setUserId] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [userDetails, setUserDetails] = useState(null);
  const [userList, setUserList] = useState([]);

  const handleSearchByUserId = async () => {
    if (!userId) return alert("Enter User ID");
    try {
      const res = await fetch('');
      const data = await res.json();
      if (res.ok) {
        setUserDetails(data);
        setUserList([]);
      } else {
        alert('User not found');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching user details');
    }
  };

  const handleFilterByDate = async () => {
    const { start, end } = dateFilter;
    if (!start || !end) return alert("Select both start and end dates");
    try {
      const res = await fetch('');
      const data = await res.json();
      if (res.ok) {
        setUserList(data);
        setUserDetails(null);
      } else {
        alert('No users found');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching user list');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("User List", 14, 15);
    const tableData = userList.map(u => [
      u.userid, u.name, u.email, u.mobile, u.createdAt
    ]);
    doc.autoTable({
      head: [['User ID', 'Name', 'Email', 'Mobile', 'Created At']],
      body: tableData,
    });
    doc.save('user_list.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(userList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_list.xlsx");
  };

  return (
    <div className="user-mgmt-container">
      <h2>User Management</h2>

      <div className="section">
        <h4>Search by User ID</h4>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={handleSearchByUserId}>Search</button>
      </div>

      <div className="section">
        <h4>Filter by Date</h4>
        <input
          type="date"
          value={dateFilter.start}
          onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
        />
        <input
          type="date"
          value={dateFilter.end}
          onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
        />
        <button onClick={handleFilterByDate}>Filter</button>
      </div>

      {userDetails && (
        <div className="user-details">
          <h4>User Details</h4>
          <pre>{JSON.stringify(userDetails, null, 2)}</pre>
        </div>
      )}

      {userList.length > 0 && (
        <div className="user-list">
          <h4>User List</h4>
          <table>
            <thead>
              <tr>
                <th>User ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user, i) => (
                <tr key={i}>
                  <td>{user.userid}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.mobile}</td>
                  <td>{user.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="export-buttons">
            <button onClick={exportToPDF}>Export PDF</button>
            <button onClick={exportToExcel}>Export Excel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;