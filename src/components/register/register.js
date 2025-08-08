import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import "./register.css";
import MenuBar from "../menumain/menubar";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Required = () => <span style={{ color: "red" }}>*</span>;

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedErrors = { ...errors };

    if (name === 'phoneNumber') {
      const phoneRegex = /^[0-9]{10}$/;
      updatedErrors.phoneNumber = !phoneRegex.test(value)
        ? 'Invalid phone number. Please enter a 10-digit number.'
        : '';
    }

    if (name === 'username' || name === 'name') {
      const regex = /^[a-zA-Z0-9 .]{4,30}$/;
      updatedErrors[name] = !regex.test(value)
        ? `${name === 'username' ? 'Username' : 'Name'} must be 4-30 characters long and can only contain letters and numbers.`
        : '';
    }

    if (name === 'email') {
      if (!value.trim()) {
        updatedErrors.email = "Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        updatedErrors.email = !emailRegex.test(value)
          ? "Invalid email format"
          : "";
      }
    }


    if (name === 'address') {
      if (!value.trim()) {
        updatedErrors[name] = "Address is required";
      } else if (value.trim().length < 20) {
        updatedErrors[name] = "Address must be at least 20 characters long";
      } else {
        updatedErrors[name] = "";
      }
    }

    if (name === 'password') {
      if (!value.trim()) {
        updatedErrors.password = "Password is required";
      } else {
        updatedErrors.password = "";
      }

      if (formData.confirmPassword && value !== formData.confirmPassword) {
        updatedErrors.confirmPassword = "Passwords do not match";
      } else if (formData.confirmPassword) {
        updatedErrors.confirmPassword = "";
      }
    }

    if (name === 'confirmPassword') {
      if (!value.trim()) {
        updatedErrors.confirmPassword = "Confirm password is required";
      } else if (value !== formData.password) {
        updatedErrors.confirmPassword = "Passwords do not match";
      } else {
        updatedErrors.confirmPassword = "";
      }
    }

    setFormData({ ...formData, [name]: value });
    setErrors(updatedErrors); // ✅ crucial: update the errors state
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 20) {
      newErrors.address = "Address must be at least 20 characters long";
    }

    return newErrors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setFormData((prevFormData) => ({
          ...prevFormData,
          profileImage: base64Image,
        }));

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
    } else {
      // No image, proceed directly
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

        toast.success("Registration successful!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Registration failed. User already registered.");
      }
    }
  };

  return (
    <div className='register-container'>
      <div><MenuBar /></div>
      <section className="container">
        <header className="heading">New User Registration</header>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-box">
            <label>Name <Required /></label>
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="input-box">
            <label>Email ID <Required /></label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
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
              />
              {errors.country && <p className="error-text">{errors.country}</p>}
            </div>

            <div className="input-box">
              <label>Phone Number <Required /></label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
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
              />
              {errors.dob && <p className="error-text">{errors.dob}</p>}
            </div>

            <div className="input-box">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
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
            <label>Address <Required /></label>
            <textarea
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
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
            <label>Username <Required /></label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

          <div className="group-container">
            <div className="input-box m-r-10">
              <label>Password <Required /></label>
            <input
                type="password"
              name="password"
                placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              />
            {errors.password && <p className="error-text">{errors.password}</p>}
            <span
              className="material-icons"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </span>
          </div>

            <div className="input-box">
              <label>Confirm Password <Required /></label>
            <input
                type="password"
              name="confirmPassword"
                placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>
            <span
              className="material-icons"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword ? "Hide Password" : "Show Password"}
            >
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
            </span>
          </div>
          
          <button type="submit">Submit</button>
        </form>
      </section>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default RegistrationForm;