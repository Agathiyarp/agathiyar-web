import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import { use } from 'react';


const ConfirmModal = ({ handleClose, roomDetails, startDate, endDate, roomsSelected, roomcost, maintanancecost, totalamount, bedsSelected, days, refreshUserCredits }) => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
  const userType = userDetails?.usertype?.trim().toLowerCase() || "";
  const totalCredit = userDetails?.credits || 0;
  const creditused = roomsSelected * days;

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const requestBody = {
      memberid: userDetails?.usermemberid,
      username: userDetails?.username,
      email: userDetails?.email,
      roomid: roomDetails?._id,
      roomname: roomDetails?.roomname,
      startdate: startDate,
      enddate: endDate,
      singleoccupy: roomDetails?.singleoccupy,
      roomdescription: roomDetails?.roomdescription,
      roomtype: roomDetails?.roomtype,
      totalroomsbooked: roomsSelected ? Number(roomsSelected) : 0,
      creditused: userType && userType !== "user" ? creditused: 0,
      extrabedbooked: bedsSelected || 0, // Assuming 1 extra bed booked
      roomvariation: roomDetails?.roomvariation,
      usertype: userType,
      roomcost,
      maintanancecost,
      totalamount
    };

    try {
      const response = await axios.post('https://agathiyarpyramid.org/api/roombooking', requestBody);
      console.log('Booking confirmed:', response.data);
      toast.success("Booking successful");
      if (typeof refreshUserCredits === "function") {
        await refreshUserCredits();
      }
      setShowSuccessModal(true);
    } catch (error) {
      const apiErrorMsg = error?.response?.data;
      if (typeof(apiErrorMsg) === 'string') {
        toast.error(apiErrorMsg);
        setShowErrorModal(true);
        return
      }
      console.error('Error confirming booking:', error);
      toast.error("Booking Failed");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    handleClose();
    navigate('/booking', { state: { bookingSuccess: true } });
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    handleClose();
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
  };

  return (
    <>
      {/* Confirmation Modal */}
      <Modal
        open={!showSuccessModal && !showErrorModal}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6">
            Confirm Proceed
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Are you sure you want to proceed with this booking?
          </Typography>
          <Box mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  color="primary"
                />
              }
              label="I agree to the Terms and Conditions"
            />
          </Box>
          <Box mt={3}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirm}
                  sx={{ mr: 2 }}
                  disabled={!isChecked}
                >
                  Yes, Proceed
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={handleSuccessClose}
        aria-labelledby="success-title"
        aria-describedby="success-description"
      >
        <Box sx={modalStyle}>
          <Typography id="success-title" variant="h6" style={{ color: 'green' }}>
            Booking Successful
          </Typography>
          <Typography id="success-description" sx={{ mt: 2 }}>
            Your booking has been forwarded to the booking admin. You will receive an email to your registered mail ID once the booking is confirmed. For more details, please visit the Contact Us section.
          </Typography>
          <Box mt={3}>
            <Button variant="contained" onClick={handleSuccessClose}>
              OK
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Error Modal */}
      <Modal
        open={showErrorModal}
        onClose={handleErrorClose}
        aria-labelledby="error-title"
        aria-describedby="error-description"
      >
        <Box sx={modalStyle}>
          <Typography id="error-title" variant="h6" color="error">
            Booking Failed
          </Typography>
          <Typography id="error-description" sx={{ mt: 2 }}>
            Something went wrong. Please try again later or contact support if the issue persists.
          </Typography>
          <Box mt={3}>
            <Button variant="contained" color="error" onClick={handleErrorClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ConfirmModal;
