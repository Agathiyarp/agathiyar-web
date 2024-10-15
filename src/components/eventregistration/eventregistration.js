import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./eventregistration.css";
import MenuBar from "../menumain/menubar";

const EventRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "Vignesh",
    email: "vikasthu20@gmail.com",
    phoneNumber: "9442235355",
    country: "india",
    username: "VigneshK",
    memberid: "AGP202400001",
    noOfUser: "3",
    noOfDays: "",
    amount: "",
    eventName: "",
    roomType: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const phoneRegex = /^[0-9]{10}$/; // Adjust the pattern based on your requirement (e.g., country codes)

      if (!phoneRegex.test(value)) {
        errors.phoneNumber =
          "Invalid phone number. Please enter a 10-digit number.";
      } else {
        errors.phoneNumber = "";
      }
    }
    if (name === "username") {
      const usernameRegex = /^[a-zA-Z0-9]{4,15}$/;

      if (!usernameRegex.test(value)) {
        errors.username =
          "Username must be 4-15 characters long and can only contain letters and numbers.";
      } else {
        errors.username = "";
      }
    }
    console.log(name, "testv1");
    if (name === "name") {
      const nameRegex = /^[a-zA-Z0-9]{4,15}$/;

      if (!nameRegex.test(value)) {
        console.log("testv2");
        errors.name =
          "Name must be 4-15 characters long and can only contain letters and numbers.";
      } else {
        errors.name = "";
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Whatsapp Phone number is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await fetch(
        "https://www.agathiyarpyramid.org/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Success:", data);
      toast.success("Registration successful!");
      navigate("/login"); // Redirect to login on success
    } catch (error) {
      console.error("Error:", error);
      toast.error("Registration failed. User Already Register");
    }
  };

  return (
    <div className="register-container">
      <div>
        <MenuBar />
      </div>
      <section className="container">
        <header>Event Registration</header>
        <form onSubmit={handleSubmit} className="form">
          {/* <div className="input-box-event">
            <label>Name: {formData.name}</label>
          </div>

          <div className="input-box-event">
            <label>Email ID: {formData.email}</label>
          </div>

          <div className="input-box-event">
            <label>Phone Number: {formData.phoneNumber}</label>
          </div>

          <div className="input-box-event">
            <label>Country: {formData.country}</label>
          </div> */}

          <div className="input-box-event">
            <label>Username: {formData.username}</label>
          </div>

          <div className="input-box-event">
            <label>Member ID: {formData.memberid}</label>
          </div>

          <button type="submit">Submit</button>
        </form>
      </section>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default EventRegistrationForm;
