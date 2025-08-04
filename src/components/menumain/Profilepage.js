import React, { useEffect, useRef, useState } from 'react';
// import profilePlaceholder from "../../images/profileImage.png";
import MenuBar from '../menumain/menubar';
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
  Paper,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Button
} from '@mui/material';
import './Profilepage.css';
import { ToastContainer, toast } from "react-toastify";
import { Home, Logout as LogOut, PhotoCamera } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE_MB = 20;

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profileImg, setProfileImg] = useState('');
  const [bookingList, setBookingList] = useState([]);
  const data = sessionStorage.getItem('userDetails');
  const parsedData = JSON.parse(data);

  const userDetails = {
    fullName: parsedData?.username,
    memberId: parsedData?.usermemberid,
    userType: parsedData?.usertype ? parsedData?.usertype : 'Admin yet to set user type',
    email: parsedData?.email,
    phone: parsedData?.phoneNumber
  };

  // 🔁 Load profile image on mount
  useEffect(() => {
  const fetchProfileImage = async () => {
    try {
      const response = await fetch(`https://www.agathiyarpyramid.org/api/user/profile-image/${parsedData?.username}`);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProfileImg(imageUrl);
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  };

  const fetchBookingList = async () => {
    try {
      const response = await fetch(`https://www.agathiyarpyramid.org/api/bookings/${parsedData?.usermemberid}`);
      if (!response.ok) throw new Error("Failed to fetch booking list");
      const result = await response.json();
      setBookingList(result || []);
    } catch (error) {
      console.error("Failed to fetch booking list:", error);
    }
  };

  fetchProfileImage();
  fetchBookingList();
}, [parsedData?.username, parsedData?.usermemberid]);


  const handleNavigate = (name) => {
    if (name === 'Home') {
      navigate('/');
    } else if (name === 'Logout') {
      const handleLogout = async () => {
        try {
          const response = await fetch("https://www.agathiyarpyramid.org/api/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: parsedData?.username }),
          });
          const data = await response.json();
          if (data) {
            toast.success("Logout successful!");
            sessionStorage.setItem("userDetails", "");
            setTimeout(() => navigate("/"), 3000);
          }
        } catch (err) {
          toast.error("Logout failed");
        }
      };
      handleLogout();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      toast.error("File size exceeds 20MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`https://www.agathiyarpyramid.org/api/user/upload-profile-image/${parsedData?.username}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      setProfileImg(result?.imageUrl || '');
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed.");
    }
  };

  const menuItems = [
    { title: 'Home', icon: <Home /> },
    { title: 'Logout', icon: <LogOut /> }
  ];

  return (
    <div className='profile-page'>
    <MenuBar/>
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100', flexDirection: { xs: 'column', sm: 'row' }}}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: { xs: '100%', sm: 240 },
          flexShrink: 0,
          mt: { xs: 2, sm: 8 },  // Add top margin (adjust as needed)
          [`& .MuiDrawer-paper`]: {
            width: { xs: '100%', sm: 240 },
            boxSizing: 'border-box',
            mt: { xs: 2, sm: 13 }, // Apply margin inside drawer paper as well
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={profileImg}
              alt="Profile"
              sx={{
                width: 200,
                height: 200,
                border: '2px solid #ccc',
                mb: 2,
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              onClick={handleImageClick}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                borderRadius: '4px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#1565c0')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#1976d2')}
            >
              Upload Image
            </button>
          </Box>

          {/* <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          /> */}
          <Typography variant="h6" sx={{ fontWeight: 500, marginTop: '1rem' }}>
            {userDetails.fullName}
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItem className="menu-item" onClick={() => handleNavigate(item.title)} button key={index}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Container sx={{ py: 4 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>About</Typography>
              {Object.entries(userDetails).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ width: '35%', fontWeight: 500, textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 'bold' }}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Booking History</Typography>

              {bookingList.length === 0 ? (
                <Typography>No bookings found.</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650, marginTop: 0  }} aria-label="booking table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#4CAF50' }}>
                        <TableCell sx={{ color: 'white' }}>Start Date</TableCell>
                        <TableCell sx={{ color: 'white' }}>End Date</TableCell>
                        <TableCell sx={{ color: 'white' }}>Booking ID</TableCell>
                        <TableCell sx={{ color: 'white' }}>Email</TableCell>
                        <TableCell sx={{ color: 'white' }}>User ID</TableCell>
                        <TableCell sx={{ color: 'white' }}>Room Name</TableCell>
                        <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookingList.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(row.createddate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(row.enddate).toLocaleDateString()}</TableCell>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.memberid}</TableCell>
                          <TableCell>{row.roomname}</TableCell>
                          <TableCell>{row.maintanancecost}</TableCell>
                          <TableCell>{row.bookingstatus}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

              )}
            </CardContent>
          </Card>


        </Container>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Box>
    </div>
  );
};

export default ProfilePage;
