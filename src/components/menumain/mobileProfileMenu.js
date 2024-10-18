import React from "react";
import { MenuItem, Avatar, Typography, Box, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import './mobileProfileMenu.css';
import mainlogo from "../../images/mainlogo.png"; 

const MobileProfileMenu = ({ onLogout }) => {
  const navigate = useNavigate();

  const user = {
    name: 'manoj',
    memberId: 'AGP202400001',
    visited: 10,
    donartype: 'Premium',
    profilePicture: mainlogo
  };

  const handleLogout = async () => {
    try {
      const sessionData = sessionStorage.getItem('userDetails');
      const username = sessionData?.username;
      const response = await fetch("https://www.agathiyarpyramid.org/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data) {
        toast.success("Logout successful!");
        sessionStorage.setItem('userDetails', '');
        onLogout(); // Call the logout function passed from MenuBar
      }
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {user && (
        <MenuItem onClick={() => navigate("/profile")}>
          <Avatar src={user.profilePicture} alt={user.name} sx={{ marginRight: "10px" }} />
          <Box>
            <Typography variant="subtitle1">{user.name}</Typography>
            <Typography variant="body2" color="textSecondary">Member ID: {user.memberId}</Typography>
            <Typography variant="body2" color="textSecondary">Visited: {user.visited} times</Typography>
            <Typography variant="body2" color="textSecondary">Donor: {user.donartype}</Typography>
          </Box>
        </MenuItem>
      )}
      <Divider />
      <MenuItem sx={{
          color: '#38a169', // Change the text color
          fontWeight: 'bold', // Make the font bold
          "&:hover": {
            backgroundColor: "#38a169", // Light red background on hover
          },
          justifyContent: 'center'
        }} onClick={handleLogout}>
        Logout
      </MenuItem>
      <Divider />
    </>
  );
};

export default MobileProfileMenu;
