import React, { useEffect, useRef, useState } from 'react';
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
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import './Profilepage.css';
import { ToastContainer, toast } from "react-toastify";
import { Home, Logout as LogOut, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE_MB = 20;

const ProfilePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef(null);
  const [profileImg, setProfileImg] = useState('');
  const [bookingList, setBookingList] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // NEW: event registrations state
  const [eventRegs, setEventRegs] = useState([]);
  const [eventRegsLoading, setEventRegsLoading] = useState(false);

  const data = sessionStorage.getItem('userDetails');
  const parsedData = data && data.length > 0 && JSON.parse(data);

  const userDetails = {
    fullName: parsedData?.username,
    memberId: parsedData?.usermemberid,
    userType: parsedData?.usertype ? parsedData?.usertype : 'Admin yet to set user type',
    email: parsedData?.email,
    phone: parsedData?.phoneNumber
  };

  // helpers
  const toDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(+dt) ? '' : dt.toLocaleDateString();
  };

  // normalize any backend key variations safely
  const normalizeEvent = (e) => ({
    userId: e?.memberid || '',
    eventName: e?.eventname || '',
    masterName: e?.eventmastername ||  '',
    startDate: e?.startdate || '',
    endDate: e?.enddate || '',
    eventDays: e?.eventdays || '',
    eventPlace: e?.eventplace || '',
    additionalMemberCount: e?.guests || '',
    mobile: e?.contact || ''
  });

  // 🔁 Load profile image + bookings + event regs on mount
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

    const fetchEventRegistrations = async () => {
      try {
        setEventRegsLoading(true);
        const response = await fetch(`https://www.agathiyarpyramid.org/api/eventregistrations`);
        if (!response.ok) throw new Error("Failed to fetch event registrations");
        const result = await response.json();

        // Result could be an array of registrations; filter by memberId (UserID) if present
        const list = Array.isArray(result) ? result : (result?.data || []);
        const normalized = list.map(normalizeEvent);

        // show only current user's rows if userId is present; else keep all
        const myMemberId = parsedData?.usermemberid;
        const filtered = myMemberId
          ? normalized.filter(r => String(r.userId).trim() === String(myMemberId).trim())
          : normalized;

        setEventRegs(filtered);
      } catch (error) {
        console.error("Failed to fetch event registrations:", error);
      } finally {
        setEventRegsLoading(false);
      }
    };

    if (parsedData?.username) fetchProfileImage();
    if (parsedData?.usermemberid) fetchBookingList();
    fetchEventRegistrations();
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
    // Close mobile drawer after navigation
    if (isMobile) {
      setMobileOpen(false);
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { title: 'Home', icon: <Home /> },
    { title: 'Logout', icon: <LogOut /> }
  ];

  // Sidebar content
  const drawerContent = (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: { xs: 1, sm: 2 } 
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={profileImg}
            alt="Profile"
            sx={{
              width: { xs: 100, sm: 150, md: 200 },
              height: { xs: 100, sm: 150, md: 200 },
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
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          sx={{ 
            fontWeight: 500, 
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          {userDetails.fullName}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem 
            className="menu-item" 
            onClick={() => handleNavigate(item.title)} 
            button 
            key={index}
            sx={{
              py: { xs: 1, sm: 1.5 },
              px: { xs: 1, sm: 2 }
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 35, sm: 40 } }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );

  // Mobile table component for better mobile experience
  const MobileBookingCard = ({ booking, index }) => (
    <Card sx={{ mb: 2, p: 1 }} key={index}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" color="primary" fontWeight="bold">
              Booking ID: {booking.id}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                backgroundColor: booking.bookingstatus === 'confirmed' ? '#e8f5e8' : '#fff3e0',
                color: booking.bookingstatus === 'confirmed' ? '#2e7d32' : '#ef6c00'
              }}
            >
              {booking.bookingstatus}
            </Typography>
          </Box>
          <Typography variant="body2"><strong>Room:</strong> {booking.roomname}</Typography>
          <Typography variant="body2"><strong>Start Date:</strong> {toDate(booking.createddate)}</Typography>
          <Typography variant="body2"><strong>End Date:</strong> {toDate(booking.enddate)}</Typography>
          <Typography variant="body2"><strong>Amount:</strong> ₹{booking.maintanancecost}</Typography>
          <Typography variant="body2"><strong>Email:</strong> {booking.email}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Mobile event card component
  const MobileEventCard = ({ event, index }) => (
    <Card sx={{ mb: 2, p: 1 }} key={index}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            {event.eventName}
          </Typography>
          <Typography variant="body2"><strong>Master:</strong> {event.masterName}</Typography>
          <Typography variant="body2"><strong>Place:</strong> {event.eventPlace}</Typography>
          <Typography variant="body2"><strong>Start Date:</strong> {toDate(event.startDate)}</Typography>
          <Typography variant="body2"><strong>End Date:</strong> {toDate(event.endDate)}</Typography>
          <Typography variant="body2"><strong>Days:</strong> {event.eventDays}</Typography>
          <Typography variant="body2"><strong>Additional Members:</strong> {event.additionalMemberCount}</Typography>
          <Typography variant="body2"><strong>Mobile:</strong> {event.mobile}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const drawerWidth = isMobile ? 280 : 240;

  return (
    <div className='profile-page'>
      <MenuBar/>
      
      {/* Mobile menu button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: { xs: 80, sm: 100 },
            left: 16,
            zIndex: 1300,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        bgcolor: 'grey.100',
        pt: { xs: 2, sm: 0 }
      }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box',
                mt: 13,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box',
                mt: 0,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* Main Content */}
        <Box sx={{ 
          flexGrow: 1,
          ml: { xs: 0, md: 0 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
        }}>
          <Container sx={{ 
            py: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 3 },
            maxWidth: { xs: '100%', sm: 'lg' }
          }}>
            {/* User Details Card */}
            <Card sx={{ 
              mb: { xs: 2, sm: 4 },
              mx: { xs: 0, sm: 'auto' }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  About
                </Typography>
                {Object.entries(userDetails).map(([key, value]) => (
                  <Box 
                    key={key} 
                    sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      py: { xs: 1, sm: 1 },
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      gap: { xs: 0, sm: 2 }
                    }}
                  >
                    <Typography sx={{ 
                      width: { xs: '100%', sm: '35%' },
                      fontWeight: 600, 
                      textTransform: 'capitalize',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </Typography>
                    <Typography sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 'normal',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      wordBreak: 'break-word'
                    }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Booking History Card */}
            <Card sx={{ 
              mb: { xs: 2, sm: 4 },
              mx: { xs: 0, sm: 'auto' }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  Booking History
                </Typography>

                {bookingList.length === 0 ? (
                  <Typography>No bookings found.</Typography>
                ) : isMobile ? (
                  // Mobile view: cards
                  <Box>
                    {bookingList.map((booking, index) => (
                      <MobileBookingCard key={index} booking={booking} index={index} />
                    ))}
                  </Box>
                ) : (
                  // Desktop view: table
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="booking table">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#4CAF50' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Start Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>End Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Booking ID</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>User ID</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Room Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bookingList.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{toDate(row.createddate)}</TableCell>
                            <TableCell>{toDate(row.enddate)}</TableCell>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.memberid}</TableCell>
                            <TableCell>{row.roomname}</TableCell>
                            <TableCell>₹{row.maintanancecost}</TableCell>
                            <TableCell>{row.bookingstatus}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Event Registrations Card */}
            <Card sx={{ mx: { xs: 0, sm: 'auto' } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  Event Registrations
                </Typography>

                {eventRegsLoading ? (
                  <Typography>Loading...</Typography>
                ) : eventRegs.length === 0 ? (
                  <Typography>No event registrations found.</Typography>
                ) : isMobile ? (
                  // Mobile view: cards
                  <Box>
                    {eventRegs.map((event, index) => (
                      <MobileEventCard key={index} event={event} index={index} />
                    ))}
                  </Box>
                ) : (
                  // Desktop view: table
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 900 }} aria-label="event registrations table">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#2E7D32' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>UserID</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>MasterName</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>StartDate</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>EndDate</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Days</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Place</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Additional Member Count</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Mobile</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eventRegs.map((r, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{r.userId}</TableCell>
                            <TableCell>
                              <Box sx={{ whiteSpace: 'pre-wrap' }}>{r.eventName}</Box>
                            </TableCell>
                            <TableCell>{r.masterName}</TableCell>
                            <TableCell>{toDate(r.startDate)}</TableCell>
                            <TableCell>{toDate(r.endDate)}</TableCell>
                            <TableCell>{r.eventDays}</TableCell>
                            <TableCell>{r.eventPlace}</TableCell>
                            <TableCell>{r.additionalMemberCount}</TableCell>
                            <TableCell>
                              <Box sx={{ whiteSpace: 'pre-wrap' }}>{r.mobile}</Box>
                            </TableCell>
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
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          style={{ top: '100px' }}
        />
      </Box>
    </div>
  );
};

export default ProfilePage;