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
    profileImage: "",
    dob: "",
    gender: "",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null); 

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

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
      const usernameRegex = /^[a-zA-Z0-9 .]{4,30}$/;

      if (!usernameRegex.test(value)) {
        errors.username = 'Username must be 4-30 characters long and can only contain letters and numbers.';
      } else {
        errors.username = '';
      }
    }
    if(name === 'name') {
      const nameRegex = /^[a-zA-Z0-9 .]{4,30}$/;

      if (!nameRegex.test(value)) {
        errors.name = 'Name must be 4-30 characters long and can only contain letters and numbers.';
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
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.address) newErrors.address = "Address is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Convert image file to Base64 and add to formData before submission
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        console.log(base64Image);
        setFormData((prevFormData) => ({
          ...prevFormData,
          profileImage: base64Image,
        }));

        // Proceed with form submission
        try {
          const response = await fetch("https://www.agathiyarpyramid.org/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData, profileImage: base64Image }),
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          toast.success("Registration successful!");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } catch (error) {
          console.error("Error:", error);
          toast.error("Registration failed. User already registered.");
        }
      };
      reader.readAsDataURL(imageFile);
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
          <div className="group-container">
          <div className="input-box m-r-10">
              <label>Country</label>
              <input
                type="text"
                name="country"
                placeholder="Enter country"
                value={formData.country}
                onChange={handleChange}
                required
              />
              {errors.country && <p className="error-text">{errors.country}</p>}
            </div>
            <div className="input-box">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
            </div>
          </div>
          <div className="group-container">
            <div className="input-box m-r-10">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              {errors.dob && <p className="error-text">{errors.dob}</p>}
            </div>

            <div className="input-box">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="error-text">{errors.gender}</p>}
            </div>
          </div>

          <div className="input-box">
            <label>Address</label>
            <textarea
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>

          <div className="input-box">
          <label>Profile Picture</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/jpeg, image/jpg, image/png, image/gif"
          />
          {errors.image && <p className="error-text">{errors.image}</p>}
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
          <div className="group-container">
            <div className="input-box m-r-10">
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
          </div>

          <button type="submit">Submit</button>
        </form>
      </section>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default RegistrationForm;