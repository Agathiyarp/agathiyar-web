import React from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import './admin.css'; // Import the CSS file
const AdminIconWithRoles = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
return (
    <>
      <Tooltip title="Admin Options">
        <IconButton
          onClick={handleClick}
          className="icon-button" // Apply the CSS class
        >
          <AdminPanelSettingsIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{ paper: 'menu-paper' }} // Use CSS class for menu paper
      >
        <MenuItem onClick={handleClose}>Super Admin</MenuItem>
        <MenuItem onClick={handleClose}>Admin 1</MenuItem>
        <MenuItem onClick={handleClose}>Admin 2</MenuItem>
        <MenuItem onClick={handleClose}>Admin 3</MenuItem>
        <MenuItem onClick={handleClose}>Admin 4</MenuItem>
      </Menu>
    </>
  );
};
export default AdminIconWithRoles;