import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import MenuBar from "../menumain/menubar";
import loginimage from '../../images/login-bg.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const navigate = useNavigate();

  const validateForm = () => {
    let formErrors = {};
    if (!username) {
      formErrors.username = "Username or MemberID is required";
    } 
    if (!password) {
      formErrors.password = "Password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      setApiError("");
      try {
          const response = await fetch("https://www.agathiyarpyramid.org/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
          toast.success("Login successful!");
          setTimeout(() => {
            navigate("/");
          }, 3000);
          // data.userRole = "admin"; // superadmin, 
          // // data.userAccess = ["users", "userAdd", "events", "bookings", "content", "video", "books", "settings"]; 

          // //get this from the API response
          // data.userAccess = ["users", "userAdd", "events", "bookings", "content", "settings"]; 
          // console.log("User Details:", data);
          sessionStorage.setItem('userDetails', JSON.stringify(data));
        } else if (response.status === 401) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(data.message || "Login failed. Please check your credentials.");
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="login-page">
      <div><MenuBar/></div>
      <div className="image-container">
        <img src={loginimage} alt="Background" />
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h3 className="heading">User Login</h3>
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter Username or MemberID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`input ${errors.email ? "error" : ""}`}
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>
          <div className="input-container password-container">
            <input
              type={showPassword ? "text" : "password"} // Toggle input type
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${errors.password ? "error-display" : ""}`}
            />
            <span
              className="material-icons toggle-password"
              onClick={() => setShowPassword(!showPassword)} // Toggle state
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </span>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          {apiError && <p className="api-error-text">{apiError}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`button login-btn ${isLoading ? "disabled" : ""}`}
          >
            {isLoading ? "Logging in..." : "Continue"}
          </button>
          <p className="signup-link">
            Don't have an account? <a href="/registration">Register</a>
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default LoginForm;