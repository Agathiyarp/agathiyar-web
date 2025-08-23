import React, { useRef, useState, useEffect } from "react";
import "./admin.css";
import MenuBar from "../menumain/menubar";
import Footer from '../footer/Footer';
import { useNavigate } from "react-router-dom";
import { ALL_CARDS } from '../../constants/cards';

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
    const userInfo = sessionStorage.getItem("userDetails");
    const userDetails = userInfo?.length ? JSON.parse(userInfo) : '';

    if (userDetails) {
      setUserType(userDetails.userrole);
      setUserAccess(userDetails.useraccess || []);
      setUserName(userDetails.username || "");

      const fetchProfileImage = async () => {
        try {
          const response = await fetch(`https://www.agathiyarpyramid.org/api/user/profile-image/${userDetails.username}`);
          if (!response.ok) throw new Error("Failed to fetch image");

          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setAvatar(imageUrl); // ✅ Set fetched image
        } catch (error) {
          console.error("Failed to fetch profile image:", error);
        }
      };

      fetchProfileImage();
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

  // Determine enabled/disabled per card
  const cardsWithStatus = ALL_CARDS?.map((card) => ({
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
    } else if (cardName === "Images") {
      navigate("/imageupload");
    } else if (cardName === "Rooms") {
      navigate("/roomlist");
    } else if (cardName === "Events") {
      navigate("/eventlist");
    } else if (cardName === "Event Details") {
      navigate("/eventdetails");
    } else if (cardName === "Booking Confirmation") {
      navigate("/bookingconfirmation");
    } else if (cardName === "Users Credit") {
      navigate("/usercredits");
    } else if (cardName === "Block Rooms") {
      navigate("/blockrooms");
    } else if (cardName === "Manual Booking") {
      navigate("/manualbooking");
    } else if (cardName === "Rooms Availability") {
      navigate("/roomsavailability");
    }
    // Add more conditions for other cards as needed
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
            <h2 className="profile-name">
              {userName?.toUpperCase() || "USER"}
            </h2>
            <p className="profile-role">Role: {userRole?.toUpperCase()}</p>
          </div>
          <div>
          {[ "Users", "Events", "Rooms", "Upload"].map((group) => {
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
                        <h4 className="card-title">{card.label}</h4>
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
      <Footer />
    </div>
  );
};

export default Admin;
