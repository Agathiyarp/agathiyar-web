import React, { useRef, useState, useEffect } from "react";
import "./admin.css";
import MenuBar from "../menumain/menubar";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef();

  // State for role and access
  const [userRole, setUserType] = useState("");
  const [userAccess, setUserAccess] = useState([]);
  const [userName, setUserName] = useState("");

  // Load user details on mount
  useEffect(() => {
    const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
    if (userDetails) {
      setUserType(userDetails.userrole);
      setUserAccess(userDetails.useraccess || []);
      setUserName(userDetails.username || []);
    }
    if (userDetails.profileImage) {
      setAvatar(userDetails.profileImage);
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setAvatar(null);
  };

  // All cards definition
  const allCards = [
    {
      key: "events",
      label: "EVENTS",
      group: "Events",
      className: "events",
      iconClass: "icon-calendar",
      cardName: "Events",
    },
    {
      key: "eventsAdd",
      label: "ADD EVENTS",
      group: "Events",
      className: "eventsAdd",
      iconClass: "icon-calendar-add",
      cardName: "Add Events",
    },
    {
      key: "eventDetails",
      label: "EVENT DETIALS",
      group: "Events",
      className: "eventDetails",
      iconClass: "icon-calendar-info",
      cardName: "Event Details",
    },
    {
      key: "users",
      label: "USERS",
      group: "Users",
      className: "user-management",
      iconClass: "icon-user",
      cardName: "User Management",
    },
    {
      key: "userAdd",
      label: "UPDATE USERS",
      group: "Users",
      className: "user-management",
      iconClass: "icon-new-user",
      cardName: "Update Users",
    },
    {
      key: "bookings",
      label: "ROOMS",
      group: "Rooms",
      className: "bookings",
      iconClass: "icon-booking",
      cardName: "Rooms",
    },
    {
      key: "bookingsAdd",
      label: "ADD ROOMS",
      group: "Rooms",
      className: "bookings",
      iconClass: "icon-booking-add",
      cardName: "Add Rooms",
    },
    {
      key: "video",
      label: "VIDEOS",
      group: "Others",
      className: "videos",
      iconClass: "icon-video",
      cardName: "Videos",
    },
    {
      key: "books",
      label: "BOOKS",
      group: "Others",
      className: "books",
      iconClass: "icon-book",
      cardName: "Books",
    },
  ];

  // Determine enabled/disabled per card
  const cardsWithStatus = allCards.map((card) => ({
    ...card,
    enabled: userRole === "superadmin" || userAccess.includes(card.key),
  }));

  // Click handler with final check
  const handleCardClick = (cardName, enabled) => {
    if (!enabled) {
      alert("You do not have access to this feature.");
      return;
    }

    if (cardName === "User Management") {
      navigate("/users");
    } else if (cardName === "Add Events") {
      navigate("/addevent");
    } else if (cardName === "Add Rooms") {
      navigate("/addrooms");
    } else if (cardName === "Books") {
      navigate("/uploadbook");
    } else if (cardName === "Update Users") {
      navigate("/updateuser");
    } else if (cardName === "Videos") {
      navigate("/videoupload");
    } else if (cardName === "Rooms") {
      navigate("/roomlist");
    } else if (cardName === "Events") {
      navigate("/eventlist");
    } else if (cardName === "Event Details") {
      navigate("/eventdetails");
    }
  };

  return (
    <div className="admin-container">
      <MenuBar />

      <main className="main-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        <div className="dashboard-layout">
          {/* Profile */}
          <div className="admin-profile">
            <div className="profile-avatar" onClick={handleAvatarClick}>
              {avatar ? (
                <img src={avatar} alt="Avatar" className="avatar-img" />
              ) : (
                "👤"
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            {avatar && (
              <button className="remove-btn" onClick={handleRemove}>
                Remove Image
              </button>
            )}
            <h2 className="profile-name">
              {userName?.toUpperCase() || "USER"}
            </h2>
            <p className="profile-role">Role: {userRole?.toUpperCase()}</p>
          </div>
          <div>
          {["Events", "Users", "Rooms", "Others"].map((group) => {
            const groupCards = cardsWithStatus.filter(
              (card) => card.group === group
            );

            return (
              groupCards.length > 0 && (
                <div key={group} className="card-group">
                  <h2 className="group-title">{group}</h2>
                  <div className="dashboard-cards">
                    {groupCards.map((card) => (
                      <div
                        key={card.key}
                        className={`dashboard-card ${card.className} ${
                          card.enabled ? "" : "disabled"
                        }`}
                        onClick={() =>
                          handleCardClick(card.cardName, card.enabled)
                        }
                      >
                        <div className={`card-icon ${card.iconClass}`}></div>
                        <h3 className="card-title">{card.label}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )
            );
          })}
          </div>

          {/* Cards */}
          {/* <div className="dashboard-cards">
            {cardsWithStatus.map((card) => (
              <div
                key={card.key}
                className={`dashboard-card ${card.className} ${card.enabled ? '' : 'disabled'}`}
                onClick={() => handleCardClick(card.cardName, card.enabled)}
              >
                <div className={`card-icon ${card.iconClass}`}></div>
                <h3 className="card-title">{card.label}</h3>
              </div>
            ))}
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Admin;
