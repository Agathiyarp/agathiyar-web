import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import MenuBar from "../menumain/menubar";
import loginimage from '../../images/reg2.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

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
          toast.success("Login successful!"); // Show success message
          setTimeout(()=> {
            navigate("/"); // Navigate to home page
          }, 3000);
          data.name = data.email;
          sessionStorage.setItem('userDetails', JSON.stringify(data));
        } else if (response.status === 401) {
          toast.error("Invalid email or password. Please try again."); // Show error message
        } else {
          toast.error(data.message || "Login failed. Please check your credentials.");
        }
      } catch (error) {
        toast.error("An error occurred. Please try again."); // Show error message
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
          <h2 className="heading">Login</h2>
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
          <div className="input-container">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${errors.password ? "error" : ""}`}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          {apiError && <p className="api-error-text">{apiError}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`button ${isLoading ? "disabled" : ""}`}
          >
            {isLoading ? "Logging in..." : "Continue"}
          </button>
          <p className="signup-link">
            Don't have an account? <a href="/registration">Sign Up</a>
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default LoginForm;