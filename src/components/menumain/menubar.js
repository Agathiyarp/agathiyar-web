import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // 3-dots icon for mobile
import { useNavigate, useLocation } from "react-router-dom";
import mainlogo from "../../images/mainlogo.png"; // Adjust the path as necessary
import './menubar.css';
import { ToastContainer, toast } from 'react-toastify';

const MenuBar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State to control mobile menu
  const isMenuOpen = Boolean(anchorEl);
  var name = '';
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location for active link highlighting

  const handleResize = () => {
    if (window.innerWidth <= 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  const routes = {
    Home: "/",
    Events: "/events",
    Videos: "/videos",
    Booking: "/booking",
    ContactUs: "/contact",
    Donate: "/donate",
    About: "/about",
    Books: "/book",
    Login: "/login"
  };

  const data = sessionStorage.getItem('userDetails');

  if(data && data.length > 0 && JSON.parse(data)?.username) {
    delete routes.Login;
    routes.Logout = "";
    name = JSON.parse(data).username;
  }

  const handleButtonClick = async (text) => {
    if (text === 'Logout') {
      try {
        const sessionData = sessionStorage.getItem('userDetails');
        const email = sessionData?.email;
        const response = await fetch("https://www.agathiyarpyramid.org/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if(data) {
          toast.success("Logout successful!"); 
          sessionStorage.setItem('userDetails', '');
        }
      } catch(err) {
        toast.error("Logout failed");
      }
      
    }
    navigate(routes[text]);
    setAnchorEl(null); // Close the mobile menu after navigating
  };

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    handleResize(); // Check the screen size on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppBar position="fixed" className="fixed-header" sx={{ backgroundColor: "white" }}>
      <Toolbar disableGutters>
        <img src={mainlogo} alt="Logo" className="logo" />
        <Typography
          sx={!isMobile ? {
            fontSize: "20px",
            color: "black",
            flexGrow: 1,
            textAlign: "left",
            fontFamily: 'Raleway, sans-serif'
          } : {
            fontSize: "14px",
            color: "black",
            flexGrow: 1,
            textAlign: "left",
            fontFamily: 'Raleway, sans-serif'
          }}
        >
          Agathiyar Pyramid
          Dhyanam Ashram
          <br />
        </Typography>

        { !isMobile &&
        <div className="menu" style={{ display: "flex", alignItems: "center", paddingLeft: "40px" }}>
          {Object.keys(routes).map((text) => (
            <Button
              key={text}
              sx={{
                color: location.pathname === routes[text] ? "blue" : "black",
                fontWeight: "bold",
                marginRight: "12px",
                transition: "background-color 0.3s, transform 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                },
                ...(location.pathname === routes[text] && {
                  backgroundColor: "rgba(0, 0, 255, 0.1)",
                  transform: "scale(1.05)",
                }),
              }}
              onClick={() => handleButtonClick(text)}
            >
              {text}
            </Button>
          ))}
        </div>}

        { isMobile &&
        <IconButton
          edge="end"
          aria-label="mobile menu"
          aria-controls="mobile-menu"
          aria-haspopup="true"
          onClick={handleMobileMenuOpen}
          sx={{
            display: { xs: 'flex', md: 'none' }, // Show only on mobile (xs and sm breakpoints)
            color: "black",
          }}
        >
          <MoreVertIcon />
        </IconButton>}

        {isMobile &&
        <Menu
          id="mobile-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMobileMenuClose}
          MenuListProps={{
            'aria-labelledby': 'mobile-menu-button',
          }}
        >
          {Object.keys(routes).map((text) => (
            <MenuItem key={text} onClick={() => handleButtonClick(text)}>
              {text}
            </MenuItem>
          ))}
        </Menu>}
      </Toolbar>
      <h3 className="welcome-text">{name && `Hello, ${name}`}</h3>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </AppBar>
  );
};

export default MenuBar;