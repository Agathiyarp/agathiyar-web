import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  MenuItem,
  Select,
  IconButton
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import AgIcon from '../../../images/mainlogo.png';

// Sample hotel data
const hotels = [
  {
    name: 'Fortune Valley View, Manipal',
    rating: 8.3,
    reviews: 775,
    price: '₹17,532',
    images: [AgIcon, AgIcon, AgIcon]
  },
  {
    name: 'Half Moon Homestay',
    rating: 5.5,
    reviews: 6,
    price: '₹23,320',
    images: [AgIcon, AgIcon, AgIcon]
  },
  {
    name: 'Hotel Ashlesh',
    rating: 6.4,
    reviews: 351,
    price: '₹10,541',
    images: [AgIcon, AgIcon, AgIcon]
  }
];

const BookingList = () => {
  return (
    <Container>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Select defaultValue="" displayEmpty>
          <MenuItem value="" disabled>
            Sort by
          </MenuItem>
          <MenuItem value="recommendations">Our recommendations</MenuItem>
          <MenuItem value="price">Price</MenuItem>
        </Select>
        <Button variant="contained" color="primary" startIcon={<ShareIcon />}>
          Share
        </Button>
      </Box>

      {/* Main content area */}
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">
        {/* Hotel cards */}
        {hotels.map((hotel, index) => (
          <Box
            key={index}
            sx={{
              border: 1,
              borderRadius: 2,
              padding: 2,
              marginBottom: 2,
              flexBasis: '30%', // Each card takes up approximately 30% of the container width
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {hotel.name}
              </Typography>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Box>


            <Box>
              <Typography variant="body1">
                {hotel.rating} - {hotel.reviews} reviews
              </Typography>
              <Typography variant="h6">{hotel.price}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mt={1}>
              {hotel.images.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`Hotel ${hotel.name} Image ${idx + 1}`}
                  style={{ width: '30%', cursor: 'pointer' }}
                />
              ))}
            </Box>

            <Box display="flex" justifyContent="flex-end" marginTop="auto">
              <Button variant="contained" color="primary">
                View Deal
              </Button>
            </Box>
          </Box>
        ))}
       
        {/* Map container */}
        <Box
          sx={{
            border: 1,
            borderRadius: 2,
            padding: 2,
            height: 400,
            flexBasis: '65%', // Map takes up 65% of the width
            marginLeft: 2 // Margin to create space between cards and map
          }}
        >
          <Typography variant="h6">Map</Typography>
          {/* Placeholder for map component */}
        </Box>
      </Box>
    </Container>
  );
};

export default BookingList;