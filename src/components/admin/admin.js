import React, { useRef, useState} from 'react';
import './admin.css';
import MenuBar from "../menumain/menubar";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const handleCardClick = (cardName) => {
    if(cardName === 'User Management') {
      navigate('/users');
    } else if(cardName === 'Events') {
      navigate('/addevent');
    } else if(cardName === 'Bookings') {
      navigate('/addbooking');
    } else if(cardName === 'Books') {
      navigate('/uploadbook');
    }
  };

  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef();

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
    e.stopPropagation(); // Prevent triggering file input
    setAvatar(null);
  };

  return (
    <div className="admin-container">
      {/* Header */}
       <MenuBar />

      {/* Main Content */}
      <main className="main-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        
        <div className="dashboard-layout">
          {/* Admin Profile */}
          <div className="admin-profile">
            <div className="profile-avatar" onClick={handleAvatarClick}>
              {avatar ? (
                <>
                  <img src={avatar} alt="Avatar" className="avatar-img" />
                </>
              ) : (
                '👤'
              )}
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
            <h2 className="profile-name">Administrator</h2>
            <p className="profile-role">Role: Admin</p>
            <p className="profile-details">Organizer, Event</p>
          </div>
          
          {/* Dashboard Cards Grid */}
          <div className="dashboard-cards">
            {/* Row 1 */}
            <div 
              className="dashboard-card user-management"
              onClick={() => handleCardClick('User Management')}
            >
              <div className="card-icon icon-user"></div>
              <h3 className="card-title">USER MANAGEMENT</h3>
            </div>
            
            <div 
              className="dashboard-card events"
              onClick={() => handleCardClick('Events')}
            >
              <div className="card-icon icon-calendar"></div>
              <h3 className="card-title">EVENTS</h3>
            </div>
            
            <div 
              className="dashboard-card bookings"
              onClick={() => handleCardClick('Bookings')}
            >
              <div className="card-icon icon-booking"></div>
              <h3 className="card-title">BOOKINGS</h3>
            </div>
            
            {/* Row 2 */}
            <div 
              className="dashboard-card contents"
              onClick={() => handleCardClick('Contents')}
            >
              <div className="card-icon icon-content"></div>
              <h3 className="card-title">CONTENTS</h3>
            </div>
            
            <div 
              className="dashboard-card videos"
              onClick={() => handleCardClick('Videos')}
            >
              <div className="card-icon icon-video"></div>
              <h3 className="card-title">VIDEOS</h3>
            </div>
            
            {/* Row 3 */}
            <div 
              className="dashboard-card books"
              onClick={() => handleCardClick('Books')}
            >
              <div className="card-icon icon-book"></div>
              <h3 className="card-title">BOOKS</h3>
            </div>
            
            <div 
              className="dashboard-card settings"
              onClick={() => handleCardClick('Settings')}
            >
              <div className="card-icon icon-settings"></div>
              <h3 className="card-title">SETTINGS</h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;