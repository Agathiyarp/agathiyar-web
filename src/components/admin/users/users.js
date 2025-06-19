import React, { useState, useEffect } from "react";
import axios from "axios";
import MenuBar from "../../menumain/menubar";
import "./users.css";

function Users() {
  const [userId, setUserId] = useState("");
  const [mobile, setMobile] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userList, setUserList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Get user details by ID and mobile
  const fetchUserDetails = async () => {
    try {
      // const response = await axios.get(
      //   ''
      // );
      // setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetails(null);
    }
  };

  // Filter users by date
  const filterUsersByDate = async () => {
    try {
      const response = await axios.get(
        ''
      );
      setUserList(response.data.users || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error("Error filtering users:", error);
      setUserList([]);
      setTotalCount(0);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen users-container">
      <MenuBar />
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {/* Search by ID and Mobile */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Find User</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
        </div>
        <button
          onClick={fetchUserDetails}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>

        {userDetails && (
          <div className="mt-4 bg-green-100 p-4 rounded">
            <p><strong>Name:</strong> {userDetails.name}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Mobile:</strong> {userDetails.mobile}</p>
            {/* Add more fields as needed */}
          </div>
        )}
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Filter Users by Date</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={filterUsersByDate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Filter
        </button>

        <div className="mt-4">
          <h4 className="font-semibold">Total Users: {totalCount}</h4>
          <ul className="mt-2">
            {userList.map((user, index) => (
              <li key={index} className="border-b py-2">
                {user.name} - {user.mobile}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Users;