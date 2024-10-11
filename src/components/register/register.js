import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import "./register.css";
import MenuBar from "../menumain/menubar";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    gender: "male",
    address: "",
    addressLine2: "",
    country: "",
    city: "",
    postalCode: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.birthDate) newErrors.birthDate = "Birth date is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
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
      navigate("/login"); // Redirect to login on success
    } catch (error) {
      console.error("Error:", error);
      toast.error("Registration failed. User Already Register");
    }
  };

  return (
    <div className='register-container'>
      <div><MenuBar /></div>
      <section className="container">
        <header>Registration Form</header>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-box">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}
          </div>

          <div className="input-box">
            <label>Email Address</label>
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
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
            </div>
            <div className="input-box">
              <label>Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
              {errors.birthDate && <p className="error-text">{errors.birthDate}</p>}
            </div>
          </div>

          <div className="gender-box">
            <h3>Gender</h3>
            <div className="gender-option">
              <div className="gender">
                <input
                  type="radio"
                  id="check-male"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                />
                <label htmlFor="check-male">Male</label>
              </div>
              <div className="gender">
                <input
                  type="radio"
                  id="check-female"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                />
                <label htmlFor="check-female">Female</label>
              </div>
              <div className="gender">
                <input
                  type="radio"
                  id="check-other"
                  name="gender"
                  value="other"
                  checked={formData.gender === "other"}
                  onChange={handleChange}
                />
                <label htmlFor="check-other">Prefer not to say</label>
              </div>
            </div>
          </div>

          <div className="input-box address">
            <label>Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter street address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <p className="error-text">{errors.address}</p>}
            <input
              type="text"
              name="addressLine2"
              placeholder="Enter street address line 2"
              value={formData.addressLine2}
              onChange={handleChange}
            />
            <div className="column">
              <div className="select-box">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option hidden>Country</option>
                  <option value="America">America</option>
                  <option value="Japan">Japan</option>
                  <option value="India">India</option>
                  <option value="Nepal">Nepal</option>
                </select>
                {errors.country && <p className="error-text">{errors.country}</p>}
              </div>
              <input
                type="text"
                name="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
            <div className="column">
              <input
                type="number"
                name="postalCode"
                placeholder="Enter postal code"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
              {errors.postalCode && <p className="error-text">{errors.postalCode}</p>}
            </div>
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