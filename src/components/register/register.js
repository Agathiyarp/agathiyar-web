import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import "./register.css";
import MenuBar from "../menumain/menubar";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    country: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name === 'phoneNumber') {
      const phoneRegex = /^[0-9]{10}$/;  // Adjust the pattern based on your requirement (e.g., country codes)
    
      if (!phoneRegex.test(value)) {
        errors.phoneNumber = 'Invalid phone number. Please enter a 10-digit number.';
      } else {
        errors.phoneNumber = '';
      }
    }
    if(name === 'username') {
      const usernameRegex = /^[a-zA-Z0-9]{4,15}$/;

      if (!usernameRegex.test(value)) {
        errors.username = 'Username must be 4-15 characters long and can only contain letters and numbers.';
      } else {
        errors.username = '';
      }
    }
    console.log(name, 'testv1')
    if(name === 'name') {
      const nameRegex = /^[a-zA-Z0-9]{4,15}$/;

      if (!nameRegex.test(value)) {
        console.log('testv2')
        errors.name = 'Name must be 4-15 characters long and can only contain letters and numbers.';
      } else {
        errors.name = '';
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Whatsapp Phone number is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

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
      const response = await fetch("https://www.agathiyarpyramid.org/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Success:", data);
      toast.success("Registration successful!");
      setTimeout(()=> {
        navigate("/login"); 
      }, 3000)
    } catch (error) {
      console.error("Error:", error);
      toast.error("Registration failed. User Already Register");
    }
  };

  return (
    <div className='register-container'>
      <div><MenuBar /></div>
      <section className="container">
        <header className="heading">New User Registration</header>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-box">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="input-box">
            <label>Email ID</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="column">
            <div className="input-box">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter Watsapp number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="input-box">
            <label>Country</label>
            <input
              type="text"
              name="country"
              placeholder="Enter Country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            {errors.country && <p className="error-text">{errors.country}</p>}
          </div>

          <div className="input-box">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

          <div className="input-box">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="input-box">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <button type="submit">Submit</button>
        </form>
      </section>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default RegistrationForm;