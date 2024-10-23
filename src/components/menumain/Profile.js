import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const ProfileMenu = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const data = sessionStorage.getItem('userDetails');

  return (
    <Box>
      {/* Only Profile Avatar */}
      {user && (
        <Box>
          <IconButton
            size="large"
            edge="end"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar src={user.profilePicture} alt={user.name} />
          </IconButton>

          {/* Profile Dropdown Menu */}
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                {`Username: ${data && JSON.parse(data)?.username}
                ${`MemberId: ${JSON.parse(data)?.usermemberid}`}
                ${`Type: ${JSON.parse(data)?.usertype}`}
                ${'Visited: 3'}`}
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onLogout(); // Call logout function
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};

export default ProfileMenu;