import React, { useState } from 'react';
import { TextField, Button, IconButton, Typography } from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import reg3 from '../../images/reg3.png';

const EventRegistration = () => {
  const [members, setMembers] = useState([{ name: '', phone: '', email: '' }]);
  const [comments, setComments] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const sessionData = sessionStorage.getItem('userDetails');
  const memberId = sessionData?.memberid;

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newMembers = [...members];
    newMembers[index][name] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    if (members.length < 3) {
      setMembers([...members, { name: '', phone: '', email: '' }]);
    }
  };

  const removeMember = (index) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const handleCommentsChange = (event) => {
    if (event.target.value.length <= 250) {
      setComments(event.target.value);
    }
  };

  const validateFields = () => {
    for (const member of members) {
      if (!member.name || !/^[a-zA-Z\s]+$/.test(member.name)) {
        setErrorMessage('Name must contain only letters and be non-empty.');
        return false;
      }
      if (!member.phone || !/^\d{10}$/.test(member.phone)) {
        setErrorMessage('Phone number must be 10 digits.');
        return false;
      }
      if (!member.email || !/\S+@\S+\.\S+/.test(member.email)) {
        setErrorMessage('Invalid email format.');
        return false;
      }
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmit = (event) => {
    console.log(members, comments); // make api call here.
    event.preventDefault();
  };

  return (
    <div style={styles.backgroundContainer}>
      <div style={styles.formContainer}>
        <h3 style={styles.heading}>
          Event Registration
        </h3>
        <form onSubmit={handleSubmit}>
          {members.map((member, index) => (
            <div key={index} style={styles.memberRow}>
              <h3 style={styles.memberTitle}>
                Member Id: {'AGP202410000'}
              </h3>
              <div>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={member.name}
                  onChange={(event) => handleInputChange(index, event)}
                  required
                  error={!/^[a-zA-Z\s]*$/.test(member.name) && member.name !== ''}
                  helperText="Name must only contain letters."
                  style={styles.textField}
                />
              </div>
              <div>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={member.phone}
                  onChange={(event) => handleInputChange(index, event)}
                  required
                  error={!/^\d{10}$/.test(member.phone) && member.phone !== ''}
                  helperText="Phone number must be 10 digits."
                  style={styles.textField}
                />
              </div>
              <div>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={member.email}
                  onChange={(event) => handleInputChange(index, event)}
                  required
                  error={!/\S+@\S+\.\S+/.test(member.email) && member.email !== ''}
                  helperText="Please enter a valid email."
                  style={styles.textField}
                />
              </div>
              {members.length > 1 && (
                <IconButton onClick={() => removeMember(index)} style={styles.removeButton}>
                  <RemoveCircle />
                </IconButton>
              )}
            </div>
          ))}

          {members.length < 3 && (
            <div style={styles.addButtonContainer}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddCircle />}
                onClick={addMember}
              >
                Add Member
              </Button>
            </div>
          )}

          <div style={styles.commentsContainer}>
            <TextField
              fullWidth
              label="Comments"
              multiline
              rows={4}
              value={comments}
              onChange={handleCommentsChange}
              helperText={`${comments.length}/250`}
              inputProps={{ maxLength: 250 }}
              style={styles.textField}
            />
          </div>

          {errorMessage && (
            <Typography color="error" align="center" style={{ marginBottom: '20px' }}>
              {errorMessage}
            </Typography>
          )}

          <Button type="submit" variant="contained" color="primary" style={styles.submitButton}>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backgroundContainer: {
    backgroundImage: `url(${reg3})`, // Replace with your image URL
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    textAlign: 'center',
    fontSize: '22px'
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '30px',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  memberRow: {
    marginBottom: '20px',
  },
  memberTitle: {
    marginBottom: '10px',
    color: '#000',
    fontWeight: '400'
  },
  textField: {
    marginBottom: '15px',
  },
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  commentsContainer: {
    marginBottom: '20px',
  },
  submitButton: {
    display: 'block',
    width: '100%',
  },
  removeButton: {
    marginTop: '10px',
  },
};

export default EventRegistration;
