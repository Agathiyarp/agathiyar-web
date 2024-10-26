import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
// import axios from 'axios';
import './Searchbar.css';

const destinations = ['Agathiyar Bhavan', 'Pathriji Bhavan'];

const Searchbar = ({onSearch}) => {
  const [destination, setDestination] = useState('Agathiyar Bhavan');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [error, setError] = useState('');
  const [daysBetween, setDaysBetween] = useState(null);
  const [isSingleOccupancy, setIsSingleOccupancy] = useState(false);

  const userDetails = sessionStorage.getItem('userDetails');
  const usertype = userDetails && JSON.parse(userDetails)?.usertype ? JSON.parse(userDetails)?.usertype : 'non-donor';
  const user = {role: usertype};

  // const getSeachResults = async (destination, checkInDate, checkOutDate, daysDifference) => {
  //   const requestBody = {

  //   };
  //   try {
  //     const response = await axios.post(
  //       "https://agathiyarpyramid.org/api/init",
  //       requestBody
  //     );
  //     console.log("Booking initialized:", response.data);
  //   } catch (error) {
  //     console.error("Error initializing booking", error);
  //   }
  // };

  const handleSearchClick = () => {

    // Clear previous error
    setError('');

    // Check if both dates are selected
    if (!checkInDate || !checkOutDate) {
      setError('Both check-in and check-out dates are required.');
      return;
    }

    // Calculate the difference in days
    const daysDifference = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');

    onSearch({
      destination,
      checkInDate,
      checkOutDate,
      noOfDays: daysDifference
    });
    
     // Check for future dates
     if (dayjs(checkInDate).isBefore(dayjs(), 'day') || dayjs(checkOutDate).isBefore(dayjs(), 'day')) {
      setError('Both check-in and check-out dates must be in the future.');
      setDaysBetween(null);
      return;
    }

    if (daysDifference < 2) {
      setError('Minimum 2 days booking is required.');
      setDaysBetween(daysDifference);
      return;
    }

    // Check for the maximum of 90 days
    if (daysDifference > 90) {
      setError('The duration between check-in and check-out cannot exceed 90 days.');
      setDaysBetween(null);
    } else if (daysDifference <= 0) {
      setError('Check-out date must be after check-in date.');
      setDaysBetween(null);
    } else {
      setDaysBetween(daysDifference);
      console.log(`Number of days: ${daysDifference}`);
    }

    if (user.role === 'non-donor') {
      if (daysDifference > 10) {
        setError('Non-donors can book a maximum of 10 days.');
        return;
      }
    } else if (user.role === 'donor') {
      if (!isSingleOccupancy) {
        setError('Donors can only book single occupancy rooms.');
        return;
      }
      if (destination !== 'Agathiyar Bhavan') {
        setError('Donors can only book rooms at Agathiyar Bhavan.');
        return;
      }
      if (daysDifference > 10) {
        setError('Donors can book a maximum of 10 days per year.');
        return;
      }
    } else if (user.role === 'sponsor') {
      if (daysDifference > 30) {
        setError('Sponsors can book a maximum of 30 days per year.');
        return;
      }
      if (user.bookedRooms >= 3) {
        setError('Sponsors can book up to 3 rooms.');
        return;
      }
      setDaysBetween(daysDifference);
    }

    // getSeachResults(destination, checkInDate, checkOutDate, daysDifference);
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

       {/* Single Occupancy Checkbox (for Donors) */}
       {user.role === 'donor' && (
        <FormControlLabel
          control={<Checkbox checked={isSingleOccupancy} onChange={(e) => setIsSingleOccupancy(e.target.checked)} />}
          label="Single occupancy"
          className="checkbox-roombooking"
        />
      )}

      {/* Search Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<SearchIcon />}
        sx={{ height: 56 }}
        onClick={handleSearchClick}
      >
        Search
      </Button>

      {/* Error message */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Display number of days */}
      {daysBetween && <div>{`No of days: ${daysBetween}`}</div>}
    </Box>
  );
};

export default Searchbar;