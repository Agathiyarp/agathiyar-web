import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Search } from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const destinations = ['Agathiyar Bhavan', 'Pathriji Bhavan'];

const Searchbar = ({onSearch}) => {
  const [destination, setDestination] = useState('Agathiyar Bhavan');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  const handleSearchClick = () => {
    onSearch({
      destination,
      checkInDate,
      checkOutDate
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, padding: 2, alignItems: 'center', backgroundColor: '#f1f1f1', borderRadius: 2 }}>
      {/* Destination Field */}
      <TextField
        select
        label="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        sx={{ minWidth: 150 }}
      >
        {destinations.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      {/* Check-in Date Picker */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Check-in"
          value={checkInDate}
          onChange={(newValue) => setCheckInDate(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <CalendarTodayIcon />
                  </IconButton>
                ),
              }}
            />
          )}
        />
      </LocalizationProvider>

      {/* Check-out Date Picker */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Check-out"
          value={checkOutDate}
          onChange={(newValue) => setCheckOutDate(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <CalendarTodayIcon />
                  </IconButton>
                ),
              }}
            />
          )}
        />
      </LocalizationProvider>

      {/* Search Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<Search />}
        sx={{ height: 56 }}
        onClick={handleSearchClick}
      >
        Search
      </Button>
    </Box>
  );
};

export default Searchbar;