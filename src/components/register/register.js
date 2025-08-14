import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Mail, Phone, Lock, MapPin, Calendar } from 'lucide-react';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MenuBar from "../menumain/menubar";

const RegistrationForm = () => {

  const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const today = new Date();
  const maxDobDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()); // must be ≥13
  const minDobDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // sanity lower bound

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    country: '',
    username: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
    dob: '',
    gender: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [focusedField, setFocusedField] = useState('');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced country list
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'South Korea', 'China', 'India', 'Brazil', 'Mexico',
    'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
    'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Finland',
    'Poland', 'Czech Republic', 'Hungary', 'Greece', 'Turkey', 'Russia'
  ];

  const genderOptions = ['Male', 'Female', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Please select a valid image file (JPEG, PNG, or GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Image size should be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any existing error
      if (errors.profileImage) {
        setErrors(prev => ({
          ...prev,
          profileImage: ''
        }));
      }
    }
  };
  // const parseDate = (dateString) => {
  //   if (!dateString) return null;
  
  //   const parts = dateString.split('/');
  //   if (parts.length !== 3) return null;
  
  //   const day = parseInt(parts[0], 10);
  //   const month = parseInt(parts[1], 10) - 1; // months are 0-based
  //   const year = parseInt(parts[2], 10);
  
  //   return new Date(year, month, day);
  // };
  
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 4) {
      newErrors.name = 'Name must be at least 4 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
    }

    // Date of Birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob); // value is YYYY-MM-DD
      if (isNaN(birthDate.getTime())) {
        newErrors.dob = 'Please select a valid date';
      } else {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (birthDate > today) {
          newErrors.dob = 'Date of birth cannot be in the future';
        } else if (age < 13) {
          newErrors.dob = 'You must be at least 13 years old';
        } else if (age > 120) {
          newErrors.dob = 'Please enter a valid date of birth';
        }
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{4,30}$/;
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Username must be 4-30 characters (letters, numbers, underscore only)';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number & special char';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 20) {
      newErrors.address = 'Address must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      let profileImageBase64 = null;
      if (formData.profileImage) {
        profileImageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(formData.profileImage);
        });
      }

      const formattedDob = formData.dob
      const response = await fetch("https://www.agathiyarpyramid.org/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dob: formattedDob,
          profileImage: profileImageBase64
        }),
      });

      if (response.ok) {
        // Success animation
        document.querySelector('.success-animation').style.animation = 'success 0.6s ease-in-out';
        toast.success("Registration successful!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMobile = viewportWidth < 768;
  const isSmallMobile = viewportWidth < 480;

  const inputStyles = (fieldName) => ({
    width: '100%',
    padding: isSmallMobile ? '12px 14px' : '14px 16px',
    border: errors[fieldName] ? '2px solid #ef4444' : focusedField === fieldName ? '2px solid #10b981' : '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: isSmallMobile ? '14px' : '14px',
    background: focusedField === fieldName ? '#ffffff' : '#f8fafc',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transform: focusedField === fieldName ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: focusedField === fieldName ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
    minHeight: fieldName === 'address' ? '80px' : 'auto'
  });

  const labelStyles = {
    fontSize: isSmallMobile ? '12px' : '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
    transition: 'color 0.2s ease'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: isSmallMobile ? '10px' : '20px',
      overflow: 'auto',
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <MenuBar />
      
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        borderRadius: '50%',
        top: '10%',
        left: '10%',
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '0s',
        display: isSmallMobile ? 'none' : 'block'
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
        borderRadius: '50%',
        top: '70%',
        right: '15%',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '2s',
        display: isSmallMobile ? 'none' : 'block'
      }}></div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '60px'
      }}>
        <div className="success-animation" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: isSmallMobile ? '16px' : '24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          width: '100%',
          maxWidth: '500px',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          animation: 'slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: isSmallMobile ? '280px' : 'auto'
        }}>
          {/* Header */}
          <div style={{
            padding: isSmallMobile ? '24px 24px 16px' : '32px 32px 24px',
            textAlign: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
          }}>
            <div style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              top: '-30px',
              left: '-20px',
              opacity: '0.8',
              animation: 'pulse 4s ease-in-out infinite',
              display: isSmallMobile ? 'none' : 'block'
            }}></div>
            
            <div style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              borderRadius: '50%',
              top: '-15px',
              right: '-15px',
              opacity: '0.6',
              animation: 'pulse 4s ease-in-out infinite',
              animationDelay: '1s',
              display: isSmallMobile ? 'none' : 'block'
            }}></div>

            <h1 style={{
              fontSize: isSmallMobile ? '22px' : '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0',
              position: 'relative',
              zIndex: '2',
              background: 'linear-gradient(135deg, #1f2937, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              New User Registration
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: isSmallMobile ? '12px' : '14px',
              margin: '8px 0 0 0',
              position: 'relative',
              zIndex: '2'
            }}>
              Join us today! Please fill in your details
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ 
            padding: isSmallMobile ? '0 20px 20px' : '0 32px 32px',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}>
            {/* Name Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyles}>
                <User size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter your full name"
                style={inputStyles('name')}
                required
              />
              {errors.name && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email and Phone */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '16px', 
              marginBottom: '20px' 
            }}>
              <div>
                <label style={labelStyles}>
                  <Mail size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter email address"
                  style={inputStyles('email')}
                  required
                />
                {errors.email && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.email}
                </span>
                )}
              </div>

              <div>
                <label style={labelStyles}>
                  <Phone size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('phoneNumber')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Phone Number"
                  style={inputStyles('phoneNumber')}
                  required
                />
                {errors.phoneNumber && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.phoneNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '16px', 
              marginBottom: '20px' 
            }}>
              <div>
                <label style={labelStyles}>
                  <Calendar size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}             // must be YYYY-MM-DD
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('dob')}
                  onBlur={() => setFocusedField('')}
                  style={inputStyles('dob')}
                  required
                  min={fmt(minDobDate)}
                  max={fmt(maxDobDate)}
                />
                {errors.dob && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.dob}
                  </span>
                )}

              </div>

              <div>
                <label style={labelStyles}>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('gender')}
                  onBlur={() => setFocusedField('')}
                  style={{
                    ...inputStyles('gender'),
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                  required
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.gender && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.gender}
                  </span>
                )}
              </div>
            </div>

            {/* Country and Profile Image */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '16px', 
              marginBottom: '20px' 
            }}>
              <div>
                <label style={labelStyles}>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('country')}
                  onBlur={() => setFocusedField('')}
                  style={{
                    ...inputStyles('country'),
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.country && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.country}
                  </span>
                )}
              </div>

              <div>
                <label style={labelStyles}>
                  <Upload size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Profile Picture (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: imagePreview ? '0' : isSmallMobile ? '10px 12px' : '14px 16px',
                      border: errors.profileImage ? '2px dashed #ef4444' : '2px dashed #d1d5db',
                      borderRadius: '12px',
                      background: imagePreview ? 'transparent' : '#f8fafc',
                      color: '#6b7280',
                      fontSize: isSmallMobile ? '13px' : '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      height: imagePreview ? 'auto' : isSmallMobile ? '40px' : '48px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = errors.profileImage ? '#ef4444' : '#d1d5db';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {!imagePreview && (
                      <>
                        <Upload size={isSmallMobile ? 16 : 18} style={{ marginRight: '8px' }} />
                        Browse Image
                      </>
                    )}
                    {imagePreview && (
                      <div style={{
                        width: '100%',
                        height: isSmallMobile ? '80px' : '100px',
                        backgroundImage: `url(${imagePreview})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '8px',
                          fontSize: '12px',
                          textAlign: 'center'
                        }}>
                          Click to change
                        </div>
                      </div>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {errors.profileImage && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.profileImage}
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label style={labelStyles}>
                <MapPin size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                Complete Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter your complete address"
                style={{
                  ...inputStyles('address'),
                  resize: 'vertical',
                  minHeight: '100px'
                }}
                required
              />
              {errors.address && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                  {errors.address}
                </span>
              )}
            </div>

            {/* Username */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyles}>
                <User size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                placeholder="Choose a unique username"
                style={inputStyles('username')}
                required
              />
              {errors.username && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                  {errors.username}
                </span>
              )}
            </div>

            {/* Password Fields */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '16px', 
              marginBottom: '24px' 
            }}>
              <div style={{ position: 'relative' }}>
                <label style={labelStyles}>
                  <Lock size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter strong password"
                  style={inputStyles('password')}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '36px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </span>
                {errors.password && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.password}
                  </span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <label style={labelStyles}>
                  <Lock size={isSmallMobile ? 14 : 16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Confirm Password *
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Confirm your password"
                  style={inputStyles('confirmPassword')}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '36px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </span>
                {errors.confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
              <input
                type="checkbox"
                id="terms"
                name="terms"
                style={{
                  accentColor: '#10b981',
                  cursor: 'pointer',
                  transform: 'scale(0.85)',          // visually smaller
                  transformOrigin: 'left center',
                  margin: 0,
                  width: '20px',
                  height: '20px',
                }}
                required
              />
              <label htmlFor="terms" style={{ color: '#4b5563', cursor: 'pointer' }}>
                I agree to the <span style={{ color: '#10b981', fontWeight: 600 }}>Terms of Service</span> and
                <span style={{ color: '#10b981', fontWeight: 600 }}> Privacy Policy</span>
              </label>
            </div>





            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: isSmallMobile ? '14px 20px' : '16px 24px',
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: isSmallMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: 'inherit',
                boxShadow: isSubmitting ? 'none' : '0 8px 20px rgba(16, 185, 129, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                {isSubmitting ? (
                  <>
                    <div style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px',
                      verticalAlign: 'text-bottom'
                    }}></div>
                    Registering...
                  </>
                ) : 'Register Now'}
              </span>
            </button>

            {/* Footer */}
            <p style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: isSmallMobile ? '12px' : '14px',
              color: '#6b7280'
            }}>
              Already have an account? {' '}
              <span 
                style={{
                  color: '#10b981',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onClick={() => navigate('/login')}
                onMouseEnter={(e) => e.target.style.color = '#059669'}
                onMouseLeave={(e) => e.target.style.color = '#10b981'}
              >
                Sign In
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        @keyframes focusPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        @keyframes success {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes errorSlide {
          0% {
            opacity: 0;
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Button click effect */
        button:active {
          transform: translateY(1px) !important;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #047857);
        }
      `}</style>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default RegistrationForm;