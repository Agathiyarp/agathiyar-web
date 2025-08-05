import React, { useState, useEffect } from 'react';
import './users.css';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import MenuBar from "../../menumain/menubar";

const UserManagement = () => {
  const [userId, setUserId] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userList, setUserList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/users');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAllUsers(data);
        setUserList(data);
        setNoResults(data.length === 0);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    }
    setLoading(false);
  };

  const handleFilter = () => {
    let filtered = [...allUsers];
    if (userId.trim()) {
      const searchVal = userId.toLowerCase();
      filtered = filtered.filter(user =>
        (user.usermemberid && user.usermemberid.toLowerCase().includes(searchVal)) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchVal)) ||
        (user.username && user.username.toLowerCase().includes(searchVal))
      );
    }
    setUserDetails(null);
    setUserList(filtered);
    setNoResults(filtered.length === 0);
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
    <div className="user-mgmt-container">
      <MenuBar />
      <h2>User List</h2>

      <div className="user-toolbar">
        <div className="search-group">
          <input
            className="input-user"
            type="text"
            placeholder="Search by MemberID, Phone or Username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button className="btn-user btn-blue" onClick={handleFilter}>Search</button>
          <button className="btn-user btn-green export-top" onClick={exportToExcel}>Export Excel</button>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {userDetails && (
        <div className="user-details">
          <h4>User Details</h4>
          <table>
            <tbody>
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
            </tbody>
          </table>
        </div>
      )}

      {noResults && <div className="no-results"><p>No users found.</p></div>}

      {userList?.length > 0 && (
        <div className="user-list1">
           <div className="table-scroll-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User ID</th><th>Username</th><th>Name</th><th>Email</th><th>Mobile</th><th>User Type</th><th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, i) => (
                  <tr key={i}>
                    <td>{user.usermemberid}</td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.usertype || 'Not specified'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;