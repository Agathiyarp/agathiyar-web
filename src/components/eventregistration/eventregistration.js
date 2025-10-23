import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import MenuBar from "../menumain/menubar";
import { ToastContainer, toast } from "react-toastify";
import bgImage from "../../images/gallery/10.png"; // Update path if needed

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const startdate = queryParams.get("startdate") || "";
  const enddate = queryParams.get("enddate") || "";
  const eventname = queryParams.get("eventname") || "";
  const eventmastername = queryParams.get("eventmastername") || "";
  const eventdays = queryParams.get("eventdays") || ""; 
  const eventplace = queryParams.get("eventplace") || "";
  const contact = queryParams.get("contact") || "";

  const sessionData = JSON.parse(sessionStorage.getItem("userDetails"));
  const memberId = sessionData?.usermemberid;
  const username = sessionData?.username;
  const email = sessionData?.email;
  const usertype = sessionData?.usertype;

  const [registerChoice, setRegisterChoice] = useState("");
  const [participantCount, setParticipantCount] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (registerChoice !== "Yes") {
      toast.info("You choose not to register.");
      return;
    }

    if (!participantCount || isNaN(participantCount) || participantCount <= 0) {
      toast.error("Please enter a valid number of participants.");
      return;
    }

    const requestBody = {
      eventid: eventId,
      memberid: memberId,
      register: true,
      guests: participantCount,
      startdate,
      enddate,
      eventname,
      eventmastername,
      eventdays,
      eventplace,
      contact,
      name: username || "",
      email: email || "",
      usertype: usertype || "",
    };

    try {
      const response = await axios.post(
        "https://agathiyarpyramid.org/api/event/user/register",
        requestBody
      );
      if (response && response.status === 201) {
        toast.success("Registration successful!");
        setTimeout(() => navigate("/events"), 1000);
      } else {
        toast.error("Registration failed.");
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("An error occurred.");
    }
  };

  return (
    <div style={{ ...styles.backgroundContainer, backgroundImage: `url(${bgImage})` }}>
      <MenuBar />
      <div style={styles.wrapper}>
        <div style={styles.formContainer}>
          <h3 style={styles.heading}>Event Registration</h3>
          <form onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              label="Do you want to register?"
              value={registerChoice}
              onChange={(e) => setRegisterChoice(e.target.value)}
              required
              style={styles.textField}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>

            {registerChoice === "Yes" && (
              <TextField
                fullWidth
                label="Number of Participants"
                type="number"
                value={participantCount}
                onChange={(e) => setParticipantCount(e.target.value)}
                required
                inputProps={{ min: 1 }}
                style={styles.textField}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={styles.submitButton}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

const styles = {
  backgroundContainer: {
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100%",
  },
  wrapper: {
    minHeight: "calc(100vh - 80px)", // adjusts for navbar height
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    fontSize: "22px",
    color: "#38a169",
    marginBottom: "50px",
  },
  textField: {
    marginBottom: "20px",
  },
  submitButton: {
    width: "100%",
  },
};

export default EventRegistration;