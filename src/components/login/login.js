import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MenuBar from "../menumain/menubar";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username or MemberID is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await fetch("https://www.agathiyarpyramid.org/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (response.ok) {
        // Success animation
        document.querySelector('.success-animation').style.animation = 'success 0.6s ease-in-out';
        toast.success("Login successful!");
        sessionStorage.setItem('userDetails', JSON.stringify(data));
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else if (response.status === 401) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
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
    boxShadow: focusedField === fieldName ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
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
          maxWidth: '450px',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          animation: 'slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: isSmallMobile ? '280px' : 'auto'
        }}>
          {/* Header with animated elements */}
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
              background: 'linear-gradient(135deg, #059669, #047857)',
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
              Welcome Back
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: isSmallMobile ? '12px' : '14px',
              margin: '8px 0 0 0',
              position: 'relative',
              zIndex: '2'
            }}>
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ 
            padding: isSmallMobile ? '0 20px 20px' : '0 32px 32px',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}>
            {/* Username Field */}
            <div className="form-field" style={{ marginBottom: '20px' }}>
              <label style={labelStyles}>
                Username or MemberID *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter your username or member ID"
                style={inputStyles('username')}
                required
              />
              {errors.username && (
                <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                  {errors.username}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-field" style={{ marginBottom: '24px', position: 'relative' }}>
              <label style={labelStyles}>
                Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter your password"
                style={inputStyles('password')}
                required
              />
              <span
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '35px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'transform 0.2s ease'
                }}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
              {errors.password && (
                <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                  {errors.password}
                </span>
              )}
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
                overflow: 'hidden',
                marginBottom: '24px'
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
                    Signing In...
                  </>
                ) : 'Sign In'}
              </span>
              {!isSubmitting && (
                <div className="loading-shimmer" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  backgroundSize: '200px 100%',
                  animation: 'shimmer 1.5s infinite',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}></div>
              )}
            </button>

            {/* Footer */}
            <p style={{
              textAlign: 'center',
              fontSize: isSmallMobile ? '12px' : '14px',
              color: '#6b7280'
            }}>
              Don't have an account? {' '}
              <a href="/registration" style={{
                color: '#10b981',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#059669';
                e.target.style.textShadow = '0 0 8px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#10b981';
                e.target.style.textShadow = 'none';
              }}>
                Register
              </a>
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

        /* Enhanced focus effects */
        input:focus,
        select:focus,
        textarea:focus {
          animation: focusPulse 0.3s ease-out;
        }

        button:active {
          transform: translateY(1px) !important;
        }

        /* Smooth error appearance */
        .error-message {
          animation: errorSlide 0.3s ease-out;
        }

        /* Loading shimmer effect */
        .loading-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }

        /* Form field animations */
        .form-field {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-field:hover {
          transform: translateY(-1px);
        }

        .form-field:focus-within label {
          color: #10b981 !important;
          transform: translateY(-1px);
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
    </div>
  );
};

export default LoginForm;