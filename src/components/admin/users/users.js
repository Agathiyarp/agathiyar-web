import React, { useState, useEffect } from "react";
import "./users.css";
import MenuBar from "../../menumain/menubar";
import { formatDate } from "../../common/utils";

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Edit states
  const [editUserId, setEditUserId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // TODO: replace with actual logged-in role
  const isAdmin = true;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://www.agathiyarpyramid.org/api/users");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAllUsers(data);
        setUserList(data);
        setNoResults(data.length === 0);
      }
    } catch (err) {
      alert("Failed to load users");
    }
    setLoading(false);
  };

  /* ---------------- SEARCH ---------------- */
  const handleSearch = () => {
    const val = search.toLowerCase().trim();
    const filtered = allUsers.filter(
      (u) =>
        u.usermemberid?.toLowerCase().includes(val) ||
        u.phoneNumber?.toLowerCase().includes(val) ||
        u.username?.toLowerCase().includes(val)
    );
    setUserList(filtered);
    setNoResults(filtered.length === 0);
    setEditUserId(null);
  };

  /* ---------------- EDIT ---------------- */
  const startEdit = (user) => {
    setEditUserId(user.usermemberid);
    setEditEmail(user.email || "");
    setEditPhone(user.phoneNumber || "");
  };

  const cancelEdit = () => {
    setEditUserId(null);
    setEditEmail("");
    setEditPhone("");
  };

  const saveEdit = async (id) => {
    if (!editEmail && !editPhone) {
      alert("Nothing to update");
      return;
    }

    try {
      const res = await fetch(
        `https://www.agathiyarpyramid.org/api/users/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: editEmail,
            phoneNumber: editPhone,
          }),
        }
      );

      if (!res.ok) throw new Error();
      alert("User updated successfully");
      cancelEdit();
      fetchUsers();
    } catch {
      alert("Update failed");
    }
  };

  /* ---------------- SOFT DELETE ---------------- */
  const softDeleteUser = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;

    try {
      const res = await fetch(
        `https://www.agathiyarpyramid.org/api/users/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();
      alert("User deactivated");
      fetchUsers();
    } catch {
      alert("Delete failed");
    }
  };

  /* ---------------- CSV EXPORT ---------------- */
  const exportCSV = () => {
    if (userList.length === 0) return;

    const headers = Object.keys(userList[0]);
    const rows = [
      headers.join(","),
      ...userList.map((u) =>
        headers
          .map((h) => `"${(u[h] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="user-mgmt-container">
      <MenuBar />
      <h2>User Management</h2>

      {/* TOOLBAR */}
      <div className="user-toolbar">
        <input
          className="input-user"
          placeholder="Search MemberID / Phone / Username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-user btn-blue" onClick={handleSearch}>
          Search
        </button>
        <button className="btn-user btn-green" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {noResults && <p>No users found</p>}

      {/* TABLE */}
      {userList.length > 0 && (
        <div className="table-scroll-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>User Type</th>
                <th>Created</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u.usermemberid}>
                  <td>{u.usermemberid}</td>
                  <td>{u.username}</td>
                  <td>{u.name}</td>

                  <td>
                    {editUserId === u.usermemberid ? (
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    ) : (
                      u.email
                    )}
                  </td>

                  <td>
                    {editUserId === u.usermemberid ? (
                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    ) : (
                      u.phoneNumber
                    )}
                  </td>

                  <td>{u.usertype || "Normal User"}</td>
                  <td>{formatDate(u.createddate)}</td>

                  {isAdmin && (
                    <td>
                      {editUserId === u.usermemberid ? (
                        <>
                          <button
                            className="btn-green"
                            onClick={() => saveEdit(u.usermemberid)}
                          >
                            Save
                          </button>
                          <button className="btn-gray" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-blue"
                            onClick={() => startEdit(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-red"
                            onClick={() => softDeleteUser(u.usermemberid)}
                          >
                            Deactivate
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
