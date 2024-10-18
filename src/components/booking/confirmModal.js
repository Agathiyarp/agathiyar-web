import React, {useState} from 'react';
import { Modal, Box, Button, Typography, Checkbox,FormControlLabel } from '@mui/material';

const ConfirmModal = ({handleClose}) => {

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  // Handle the confirmation action
  const handleConfirm = () => {
    console.log('Proceed confirmed');
    handleClose();
  };

  // Modal styling
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
    <div>
      <Modal
        open={true}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              sx={{ mr: 2 }}
            >
              Yes, Proceed
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ConfirmModal;
