import React, { useState, useEffect } from 'react';
import './users.css';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import MenuBar from "../../menumain/menubar";
import { formatDate } from '../../common/utils';

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

  const exportToCSV = () => {
  if (userList.length === 0) return;

  // Step 1: Clean and transform user data
  const cleanedData = userList.map(({ useraccess, ...rest }) => ({
    ...rest,
    userrole: rest.userrole && rest.userrole.trim() !== "" ? rest.userrole : "Normal user",
    usertype: rest.usertype && rest.usertype.trim() !== "" ? rest.usertype : "No access option",
    createddate: rest.createddate ? formatDate(rest.createddate) : "",
    creditmodifiedate: rest.creditmodifiedate ? formatDate(rest.creditmodifiedate) : "",
    usertypemodifiedate: rest.usertypemodifiedate ? formatDate(rest.usertypemodifiedate) : "",
  }));

  // Step 2: Convert to CSV format
  const headers = Object.keys(cleanedData[0]); // Auto headers from first record
  const csvRows = [
    headers.join(","), // header row
    ...cleanedData.map(obj =>
      headers.map(header => `"${(obj[header] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ];

  const csvContent = csvRows.join("\n");

  // Step 3: Trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `user_list_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Helper: Convert ISO date to DD-MM-YYYY
function formatDate(isoDate) {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return isoDate;
  }
}

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
          <button className="btn-user btn-green export-top" onClick={exportToCSV}>Export Excel</button>
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
              <tr><td><strong>UserName</strong></td><td>{userDetails.username || '-'}</td></tr>
              <tr><td><strong>MemberID</strong></td><td>{userDetails.usermemberid || '-'}</td></tr>
              <tr><td><strong>UserType</strong></td><td>{userDetails.usertype || '-'}</td></tr>
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
                    <td>{formatDate(user.createddate)}</td>
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