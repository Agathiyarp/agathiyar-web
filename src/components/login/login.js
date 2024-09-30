import React, { useState } from 'react';
import './login.css'

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    let formErrors = {};
    if (!email) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email is invalid';
    }
    if (!password) {
      formErrors.password = 'Password is required';
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      setApiError('');
      try {
        const response = await fetch('https://api.example.com/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          // Handle successful login (e.g., store token, redirect)
          console.log('Login successful', data);
        } else {
          setApiError(data.message || 'Login failed');
        }
      } catch (error) {
        setApiError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
          </div>
          {apiError && <p className="mb-4 text-red-500 text-sm text-center">{apiError}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Logging in...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;