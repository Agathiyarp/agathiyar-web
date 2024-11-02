import React from 'react';
import profile from "../../images/profileImage.png";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper
} from '@mui/material';
import './Profilepage.css'
import { ToastContainer, toast } from "react-toastify";
import { 
  Home, 
  Logout as LogOut
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const menuItems = [
    { title: 'Home', icon: <Home /> },
    { title: 'Logout', icon: <LogOut /> }
  ];
  const data = sessionStorage.getItem('userDetails');
  const profileImg = JSON.parse(data)?.profileImage

  const userDetails = {
    fullName:  `${JSON.parse(data)?.username}`,
    memberId: `${JSON.parse(data)?.usermemberid}`,
    userType: `${JSON.parse(data)?.usertype}`,
    email: `${JSON.parse(data)?.email}`,
    phone: `${JSON.parse(data)?.phoneNumber}`
  };

  const handleNavigate = (name)=> {
    if(name === 'Home'){
        navigate('/');
    } else if(name === 'Logout') {
        const handleLogout = async () => {
            try {
              const sessionData = sessionStorage.getItem("userDetails");
              const username = sessionData?.username;
              const response = await fetch(
                "https://www.agathiyarpyramid.org/api/logout",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ username }),
                }
              );
              const data = await response.json();
              if (data) {
                toast.success("Logout successful!");
                sessionStorage.setItem("userDetails", "");
                setTimeout(()=> {
                    navigate("/");
                }, 3000)
              }
            } catch (err) {
              toast.error("Logout failed");
            }
          };
          handleLogout()
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100', flexDirection: { xs: 'column', sm: 'row' } }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: { xs: '100%', sm: 240 },
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: { xs: '100%', sm: 240 }, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Avatar sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, bgcolor: 'primary.main' }}>
            {/* <User sx={{ fontSize: { xs: 30, sm: 40 } }} /> */}
            <img className='profile-image' src={profileImg} alt="profileImage"/>
          </Avatar>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1rem' }, fontWeight: 500, marginTop: '1rem' }}>
            {userDetails.fullName}
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItem className="menu-item" onClick={()=>handleNavigate(item.title)} button key={index}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>

        <Container sx={{ py: 4 }}>
          {/* About Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                About
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(userDetails).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ width: '35%', fontWeight: 500, textTransform: 'capitalize', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Recent Projects Section */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                Booking History
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Typography sx={{ width: { xs: '100%', sm: '25%' }, fontWeight: 500 }}>
                    Booking Details
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', mt: { xs: 1, sm: 0 } }}>
                    Booking Description
                  </Typography>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </Box>
  );
};

export default ProfilePage;
