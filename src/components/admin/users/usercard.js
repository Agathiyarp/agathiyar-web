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

const USER_TYPE_OPTIONS = ["donar", "sponsor", "patron"];

const UserCard = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [defaultCreditsMap, setDefaultCreditsMap] = useState({});

  useEffect(() => {
    setFormData(user);

    fetch("https://www.agathiyarpyramid.org/api/credits")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load credit mapping");
      return res.json();
    })
    .then((data) => {
      setDefaultCreditsMap(data || {});
    })
    .catch((err) => {
      console.error("Error loading credits map:", err);
      setDefaultCreditsMap({}); // fallback
    });
  }, [user]);

  const handleUserTypeChange = (e) => {
    const selectedType = e.target.value;
    const defaultCredits = defaultCreditsMap[0][selectedType];

    setFormData((prev) => ({
      ...prev,
      usertype: selectedType,
      credits: defaultCredits,
    }));
  };

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
      credits: formData.credits || 0, 
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
            onChange={handleUserTypeChange}
          >
            <option value="">Select User Type</option>
            {USER_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                 {type?.charAt(0).toUpperCase() + type?.slice(1)}
              </option>
            ))}
          </select>

          <input
            name="availablecredits"
            value={formData.credits || 0}
            readOnly
            placeholder="Available Credits"
            style={{ backgroundColor: "#f5f5f5", color: "#555" }}
          />

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
          {!["admin", "superadmin"].includes(formData.userrole) && (
            <p style={{ fontSize: "0.9em", color: "#888", marginLeft: "5px"}}>
              User role has no access options.
            </p>
          )}
          {formData.userrole === "superadmin" && (
            <p style={{ fontSize: "0.9em", color: "#888", marginLeft: "5px" }}>
              Superadmin has all access.
            </p>
          )}
          
          {formData.userrole === "admin" && 
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
          </div>}
          
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
            <strong>User Type:</strong> {user.usertype ? user.usertype: "Not specified"}
          </p>
          {user.usertype && user.usertype !== "user" ? <p><strong>Available Credits:</strong> {user.credits || 0}</p>: ''}
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
