import React from "react";
import { MenuItem, Avatar, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./mobileProfileMenu.css";
import profile from "../../images/profileImage.png";
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';

const MobileProfileMenu = ({ onLogout }) => {
  const navigate = useNavigate();

  const user = {
    name: "manoj",
    memberId: "AGP202400001",
    visited: 10,
    donartype: "Premium",
    profilePicture: profile,
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
        setTimeout(()=> {
          navigate('/')
        }, 3000);
      }
    } catch (err) {
      toast.error("Logout failed");
    }
  };
  const handleGoBack = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <>
      {user && (
        <MenuItem onClick={() => navigate("/profile")}>
          <Avatar
            src={user.profilePicture}
            alt={user.name}
            sx={{ marginRight: "10px", width: '150px', height: '150px' }}
          />
          <Box>
            <Typography variant="h5" color="info" sx={{marginBottom: '10px'}}>{user.name}</Typography>
            <Typography variant="body2" color="success">
              Member ID: {user.memberId}
            </Typography>
            <Typography variant="body2" color="success">
              Visited: {user.visited} times
            </Typography>
            <Typography variant="body2" color="success">
              Donor: {user.donartype}
            </Typography>
          </Box>
        </MenuItem>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, color: "#38a169"}}>
        <Button
          variant="outlined"
          onClick={handleLogout}
          fullWidth={true} // Full width button for mobile view
          color={"#38a169"}
        >
          Logout
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleGoBack}
          fullWidth={true} // Full width button for mobile view
        >
          Back to Home
        </Button>
      </Box>
    </>
  );
};

export default MobileProfileMenu;
