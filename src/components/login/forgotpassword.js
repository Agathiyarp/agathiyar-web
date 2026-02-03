import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MenuBar from "../menumain/menubar";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ---------------- SEND OTP ---------------- */
  const handleSendOtp = async () => {
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://www.agathiyarpyramid.org/api/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setServerOtp(String(data.otp)); // 🔥 store OTP as string
        toast.success(data.message || "OTP sent");
        setStep(2);
      } else {
        toast.error(data.message || "Unable to process request");
      }

    } catch {
      toast.error("Please enter registered email address");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerifyOtp = () => {
    setOtpError("");

    if (!otp) {
      setOtpError("OTP is required");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    if (otp !== serverOtp) {
      console.log("Entered OTP:", otp, "Expected OTP:", serverOtp);
      setOtpError("Invalid OTP. Please try again.");
      return; // ❌ do NOT proceed
    }

    toast.success("OTP verified successfully");
    setStep(3); // ✅ proceed only if OTP matches
  };


  /* ---------------- RESET PASSWORD ---------------- */
  const handleResetPassword = async () => {
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Both password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://www.agathiyarpyramid.org/api/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Password reset successful");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MenuBar />

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "32px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            background: "#fff",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 30 }}>
            Forgot Password
          </h2>

          {/* STEP 1 – EMAIL */}
          {step === 1 && (
            <>
              <input
                type="email"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                style={inputStyle}
              />

              {emailError && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {emailError}
                </p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                style={buttonStyle}
              >
                {loading ? "Sending OTP..." : "Submit"}
              </button>
            </>
          )}

          {/* STEP 2 – OTP */}
          {step === 2 && (
            <>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // numbers only
                  setOtp(value);
                  setOtpError("");
                }}
                style={{
                  ...inputStyle,
                  border: otpError ? "2px solid #ef4444" : "2px solid #e5e7eb",
                }}
              />
              {otpError && (
                <p style={{
                  color: "#ef4444",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}>
                  {otpError}
                </p>
              )}

              <button onClick={handleVerifyOtp} style={buttonStyle}>
                Verify OTP
              </button>
            </>
          )}

          {/* STEP 3 – RESET PASSWORD */}
          {step === 3 && (
            <>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
              {passwordError && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {passwordError}
                </p>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading}
                style={buttonStyle}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 20 }}>
            <span
              style={{ color: "#10b981", cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "12px",
  border: "2px solid #e5e7eb",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

export default ForgotPassword;
