import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import mainlogo from "../../images/mainlogo.png"; // Adjust the path as necessary
import './menubar.css';

const MenuBar = () => {
  var name = '';
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location for active link highlighting

  const routes = {
    Home: "/",
    Events: "/events",
    Videos: "/videos",
    "Contact Us": "/contact",
    Donate: "/donate",
    About: "/about",
    Books: "/book",
    Login: "/login"
  };

  const data = sessionStorage.getItem('userDetails');

  if(data && data.length > 0 && JSON.parse(data)?.name) {
    delete routes.Login;
    routes.Logout = "";
    name = JSON.parse(data).name;
  }

  const handleButtonClick = (text) => {
    if(text === 'Logout') {
      sessionStorage.setItem('userDetails', '')
    }
    navigate(routes[text]);
  };

  return (
    <AppBar position="fixed" className="fixed-header" sx={{ backgroundColor: "white" }}>
      <Toolbar disableGutters>
        <img src={mainlogo} alt="Logo" className="logo" />
        <Typography
          sx={{
            fontSize: "23px",
            fontWeight: "bold",
            color: "black",
            flexGrow: 1,
            textAlign: "left",
          }}
        >
          AGATHIYAR PYRAMID <br />
          DHYANA ASHRAM
          <br />
          <span style={{ fontSize: 14 }}>Mounam - Dhyanam - Gnanam</span>
        </Typography>

        <div className="menu" style={{ display: "flex", alignItems: "center", paddingLeft: "40px" }}>
          {Object.keys(routes).map((text) => (
            <Button
              key={text}
              sx={{
                color: location.pathname === routes[text] ? "blue" : "black", // Highlight active link
                fontWeight: "bold",
                marginRight: "12px",
                transition: "background-color 0.3s, transform 0.2s", // Smooth transition
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.1)", // Add a hover effect
                },
                ...(location.pathname === routes[text] && {
                  backgroundColor: "rgba(0, 0, 255, 0.1)", // Selected button effect
                  transform: "scale(1.05)", // Slightly enlarge the selected button
                }),
              }}
              onClick={() => handleButtonClick(text)}
            >
              {text}
            </Button>
          ))}
        </div>
      </Toolbar>
      <h3 className="welcome-text">{name && `Hello, ${name}`}</h3>
    </AppBar>
  );
};

export default MenuBar;