import React, { useRef, useState, useEffect } from 'react';
import './admin.css';
import MenuBar from "../menumain/menubar";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef();

  // State for role and access
  const [userRole, setUserType] = useState('');
  const [userAccess, setUserAccess] = useState([]);

  // Load user details on mount
  useEffect(() => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    if (userDetails) {
      setUserType(userDetails.userrole);
      setUserAccess(userDetails.useraccess || []);
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
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
    { key: 'users', label: 'USERS', className: 'user-management', iconClass: 'icon-user', cardName: 'User Management' },
     { key: 'userAdd', label: 'UPDATE USERS', className: 'user-management', iconClass: 'icon-new-user', cardName: 'Update Users' },
    { key: 'events', label: 'EVENTS', className: 'events', iconClass: 'icon-calendar', cardName: 'Events' },
    { key: 'bookings', label: 'ADD ROOMS', className: 'bookings', iconClass: 'icon-booking', cardName: 'Add Rooms' },
    // { key: 'content', label: 'CONTENTS', className: 'contents', iconClass: 'icon-content', cardName: 'Contents' },
    { key: 'video', label: 'VIDEOS', className: 'videos', iconClass: 'icon-video', cardName: 'Videos' },
    { key: 'books', label: 'BOOKS', className: 'books', iconClass: 'icon-book', cardName: 'Books' },
    // { key: 'settings', label: 'SETTINGS', className: 'settings', iconClass: 'icon-settings', cardName: 'Settings' },
  ];

  // Determine enabled/disabled per card
  const cardsWithStatus = allCards.map(card => ({
    ...card,
    enabled: userRole === 'superadmin' || userAccess.includes(card.key)
  }));

  // Click handler with final check
  const handleCardClick = (cardName, enabled) => {
    if (!enabled) {
      alert('You do not have access to this feature.');
      return;
    }

    if (cardName === 'User Management') {
      navigate('/users');
    } else if (cardName === 'Events') {
      navigate('/addevent');
    } else if (cardName === 'Add Rooms') {
      navigate('/addrooms');
    } else if (cardName === 'Books') {
      navigate('/uploadbook');
    } else if(cardName === 'Update Users') {
      navigate('/updateuser')
    } else if(cardName === 'Videos') {
      navigate('/videoupload')
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
              ) : '👤'}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            {avatar && (
              <button className="remove-btn" onClick={handleRemove}>
                Remove Image
              </button>
            )}
            <h2 className="profile-name">{userRole?.toUpperCase() || 'ADMINISTRATOR'}</h2>
            <p className="profile-role">Role: {userRole}</p>
            <p className="profile-details">Organizer, Event</p>
          </div>

          {/* Cards */}
          <div className="dashboard-cards">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;