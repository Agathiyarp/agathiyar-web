import React, { useState, useEffect } from "react";
import "./updateuser.css";

const USER_ROLES = ["user", "admin", "superadmin"];

const ACCESS_OPTIONS = [
  "users",
  "userAdd",
  "events",
  "bookings",
  "content",
  "video",
  "books",
  "settings",
];

const USER_TYPE_OPTIONS = ["Donar", "Sponsor", "Patron"];

const UserCard = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleRoleChange = (e) => {
    const value = e.target.value;
    let newAccess = [];

    if (value === "admin" || value === "superadmin") {
      newAccess = ACCESS_OPTIONS;
    }

    setFormData((prev) => ({
      ...prev,
      userrole: value,
      useraccess: newAccess,
    }));
  };

  const handleAccessCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let updatedAccess = prev.useraccess ? [...prev.useraccess] : [];
      if (checked) {
        if (!updatedAccess.includes(value)) {
          updatedAccess.push(value);
        }
      } else {
        updatedAccess = updatedAccess.filter((item) => item !== value);
      }
      return { ...prev, useraccess: updatedAccess };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.usermemberid) {
      alert("User Member ID is required!");
      return;
    }

    // Final payload
    const payload = {
      name: formData.name || "",
      userrole: formData.userrole || "",
      useraccess: formData.useraccess || [],
      usertype: formData.usertype || "",
      usermemberid: formData.usermemberid,
    };

    fetch("https://www.agathiyarpyramid.org/api/updateuser", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update user");
        }
        return response.text(); // Don't force JSON
      })
      .then((text) => {
        console.log("API Raw Response Text:", text);
        onSave(payload);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to update user. Please try again.");
      });
  };

  return (
    <div className="user-card">
      {isEditing ? (
        <form className="edit-form" onSubmit={handleSubmit}>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            placeholder="Name"
          />

          <select
            name="usertype"
            value={formData.usertype || ""}
            onChange={handleInputChange}
          >
            <option value="">Select User Type</option>
            {USER_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            name="userrole"
            value={formData.userrole || ""}
            onChange={handleRoleChange}
          >
            <option value="">Select Role</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {formData.userrole === "admin" ||
          formData.userrole === "superadmin" ? (
            <div className="access-checkbox-group">
              {ACCESS_OPTIONS.map((access) => (
                <label key={access}>
                  {access}
                  <input
                    type="checkbox"
                    value={access}
                    checked={formData.useraccess?.includes(access) || false}
                    onChange={handleAccessCheckbox}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.9em", color: "#888" }}>
              User role has no access options
            </p>
          )}

          <div className="button-row">
            <button type="submit">Update</button>
            <button
              type="button"
              onClick={() => {
                setFormData(user);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 onClick={() => setIsEditing(true)}>{user.name}</h2>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>User Member ID:</strong> {user.usermemberid}
          </p>
          <p>
            <strong>User Role:</strong> {user.userrole}
          </p>
          <p>
            <strong>User Type:</strong> {user.usertype}
          </p>
          <p>
            <strong>User Access:</strong>{" "}
            {Array.isArray(user?.useraccess) && user.useraccess.length
              ? user.useraccess.join(", ")
              : "None"}
          </p>
        </>
      )}
    </div>
  );
};

export default UserCard;
