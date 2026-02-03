package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

// ForgotPasswordRequest represents the initial forgot password request
type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

// ForgotPasswordResponse represents the response with OTP
type ForgotPasswordResponse struct {
	MemberID string `json:"memberid"`
	Email    string `json:"email"`
	Username string `json:"username"`
	OTP      string `json:"otp"`
	Message  string `json:"message"`
}

// ResetPasswordRequest represents the password reset request with OTP
type ResetPasswordRequest struct {
	Email       string `json:"email"`
	OTP         string `json:"otp"`
	NewPassword string `json:"newPassword"`
}

// ResetPasswordResponse represents the password reset response
type ResetPasswordResponse struct {
	Message string `json:"message"`
}

// In-memory OTP storage (in production, use Redis or database with expiration)
var otpStore = make(map[string]string)

// generateOTP generates a 6-digit random OTP
func generateOTP() (string, error) {
	logMessage(INFO, "generateOTP: Generating 6-digit OTP")

	otp := ""
	for i := 0; i < 6; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("generateOTP: Error generating random number: %v", err))
			return "", err
		}
		otp += fmt.Sprintf("%d", num.Int64())
	}

	logMessage(DEBUG, fmt.Sprintf("generateOTP: Generated OTP: %s", otp))
	return otp, nil
}

// sendOTPEmail sends the OTP to the user's email
func sendOTPEmail(email, username, otp string) error {
	logMessage(INFO, fmt.Sprintf("sendOTPEmail: Sending OTP to email: %s", email))

	// Decrypt the email password
	decrypted, err := Decrypt(RegisterPassword)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("sendOTPEmail: Failed to decrypt email password: %v", err))
		return err
	}

	// Create email message
	m := gomail.NewMessage()
	m.SetHeader("From", AgathiyarEmail)
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Password Reset OTP - Agathiyar Pyramid")

	// Build email body with premium HTML design
	emailBody := buildOTPEmailBody(username, otp)
	m.SetBody("text/html", emailBody)

	// Set up the SMTP dialer
	dialer := gomail.NewDialer(SmtpHost, SmtpPort, AgathiyarEmail, decrypted)

	// Send the email
	if err := dialer.DialAndSend(m); err != nil {
		logMessage(ERROR, fmt.Sprintf("sendOTPEmail: Failed to send email: %v", err))
		return err
	}

	logMessage(INFO, fmt.Sprintf("sendOTPEmail: OTP email sent successfully to: %s", email))
	return nil
}

// buildOTPEmailBody creates a premium HTML email body for OTP
func buildOTPEmailBody(username, otp string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); min-height: 100vh;">
    <table role="presentation" style="width: 100%%; border-collapse: collapse; margin: 0; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%%; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🔐 Password Reset Request
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hello <strong>%s</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                                We received a request to reset your password. Use the OTP below to complete the password reset process:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="margin: 0 0 10px; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                    Your OTP Code
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    %s
                                </p>
                            </div>
                            
                            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                    ⚠️ <strong>Important:</strong> This OTP is valid for a single use only. Do not share this code with anyone.
                                </p>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                                Best regards,<br>
                                <strong style="color: #495057;">Agathiyar Pyramid Team</strong>
                            </p>
                            <p style="margin: 15px 0 0; color: #adb5bd; font-size: 12px;">
                                This is an automated message, please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, username, otp)
}

// sendPasswordResetConfirmationEmail sends confirmation email with user details and new password
func sendPasswordResetConfirmationEmail(user RegisterUser, newPassword string) error {
	logMessage(INFO, fmt.Sprintf("sendPasswordResetConfirmationEmail: Sending confirmation to email: %s", user.Email))

	// Decrypt the email password
	decrypted, err := Decrypt(RegisterPassword)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("sendPasswordResetConfirmationEmail: Failed to decrypt email password: %v", err))
		return err
	}

	// Create email message
	m := gomail.NewMessage()
	m.SetHeader("From", AgathiyarEmail)
	m.SetHeader("To", user.Email)
	m.SetHeader("Subject", "Password Reset Successful - Agathiyar Pyramid")

	// Build email body with premium HTML design
	emailBody := buildPasswordResetConfirmationEmailBody(user, newPassword)
	m.SetBody("text/html", emailBody)

	// Set up the SMTP dialer
	dialer := gomail.NewDialer(SmtpHost, SmtpPort, AgathiyarEmail, decrypted)

	// Send the email
	if err := dialer.DialAndSend(m); err != nil {
		logMessage(ERROR, fmt.Sprintf("sendPasswordResetConfirmationEmail: Failed to send email: %v", err))
		return err
	}

	logMessage(INFO, fmt.Sprintf("sendPasswordResetConfirmationEmail: Confirmation email sent successfully to: %s", user.Email))
	return nil
}

// buildPasswordResetConfirmationEmailBody creates a premium HTML email body for password reset confirmation
func buildPasswordResetConfirmationEmailBody(user RegisterUser, newPassword string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); min-height: 100vh;">
    <table role="presentation" style="width: 100%%; border-collapse: collapse; margin: 0; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%%; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                ✅ Password Reset Successful
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hello <strong>%s</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                                Your password has been successfully reset. Below are your updated account details:
                            </p>
                            
                            <!-- User Details Box -->
                            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid #e9ecef;">
                                <h2 style="margin: 0 0 20px; color: #11998e; font-size: 18px; font-weight: 600;">
                                    📋 Account Details
                                </h2>
                                
                                <table style="width: 100%%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600; width: 40%%;">
                                            Member ID:
                                        </td>
                                        <td style="padding: 10px 0; color: #333333; font-size: 14px;">
                                            <strong>%s</strong>
                                        </td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e9ecef;">
                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                                            Username:
                                        </td>
                                        <td style="padding: 10px 0; color: #333333; font-size: 14px;">
                                            <strong>%s</strong>
                                        </td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e9ecef;">
                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                                            Email:
                                        </td>
                                        <td style="padding: 10px 0; color: #333333; font-size: 14px;">
                                            <strong>%s</strong>
                                        </td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e9ecef;">
                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                                            Phone Number:
                                        </td>
                                        <td style="padding: 10px 0; color: #333333; font-size: 14px;">
                                            <strong>%s</strong>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- New Password Box -->
                            <div style="background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                                <p style="margin: 0 0 10px; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                    Your New Password
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace; word-break: break-all;">
                                    %s
                                </p>
                            </div>
                            
                            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                    ⚠️ <strong>Security Tip:</strong> We recommend changing this password after logging in. Keep your password secure and don't share it with anyone.
                                </p>
                            </div>
                            
                            <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #0c5460; font-size: 14px; line-height: 1.5;">
                                    ℹ️ <strong>Next Steps:</strong> You can now log in to your account using your email or username with the new password provided above.
                                </p>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                                If you did not request this password reset, please contact our support team immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                                Best regards,<br>
                                <strong style="color: #495057;">Agathiyar Pyramid Team</strong>
                            </p>
                            <p style="margin: 15px 0 0; color: #adb5bd; font-size: 12px;">
                                This is an automated message, please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, user.Name, user.UserMemberID, user.Username, user.Email, user.PhoneNumber, newPassword)
}

// forgotPasswordHandler handles the initial forgot password request
func forgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "forgotPasswordHandler: Received forgot password request")

	var req ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logMessage(ERROR, fmt.Sprintf("forgotPasswordHandler: Failed to decode request body: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Validate email
	if req.Email == "" {
		logMessage(WARN, "forgotPasswordHandler: Email is required")
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("forgotPasswordHandler: Processing request for email: %s", req.Email))

	// Find user by email
	collection := client.Database(DBName).Collection(UserCollection)
	var user RegisterUser
	filter := bson.M{"email": req.Email}

	if err := collection.FindOne(context.TODO(), filter).Decode(&user); err != nil {
		if err == mongo.ErrNoDocuments {
			logMessage(WARN, fmt.Sprintf("forgotPasswordHandler: No user found with email: %s", req.Email))
			// For security, don't reveal if email exists or not
			http.Error(w, "If the email exists, an OTP has been sent", http.StatusOK)
			return
		}
		logMessage(ERROR, fmt.Sprintf("forgotPasswordHandler: MongoDB error: %v", err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("forgotPasswordHandler: Found user: %s (MemberID: %s)", user.Username, user.UserMemberID))

	// Generate OTP
	otp, err := generateOTP()
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("forgotPasswordHandler: Failed to generate OTP: %v", err))
		http.Error(w, "Failed to generate OTP", http.StatusInternalServerError)
		return
	}

	// Store OTP in memory (associated with email)
	otpStore[req.Email] = otp
	logMessage(DEBUG, fmt.Sprintf("forgotPasswordHandler: OTP stored for email: %s", req.Email))

	// Send OTP via email
	emailErr := sendOTPEmail(user.Email, user.Name, otp)
	if emailErr != nil {
		logMessage(WARN, fmt.Sprintf("forgotPasswordHandler: Failed to send OTP email: %v", emailErr))
		// Continue even if email fails - still return OTP in response
	}

	// Prepare response
	response := ForgotPasswordResponse{
		MemberID: user.UserMemberID,
		Email:    user.Email,
		Username: user.Username,
		OTP:      otp,
		Message:  "OTP generated successfully. Please check your email.",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		logMessage(ERROR, fmt.Sprintf("forgotPasswordHandler: Error encoding response: %v", err))
		return
	}

	logMessage(INFO, fmt.Sprintf("forgotPasswordHandler: OTP sent successfully for user: %s", user.Username))
}

// resetPasswordHandler handles the password reset with OTP verification
func resetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "resetPasswordHandler: Received password reset request")

	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logMessage(ERROR, fmt.Sprintf("resetPasswordHandler: Failed to decode request body: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.OTP == "" || req.NewPassword == "" {
		logMessage(WARN, "resetPasswordHandler: Missing required fields")
		http.Error(w, "Email, OTP, and new password are required", http.StatusBadRequest)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("resetPasswordHandler: Processing reset for email: %s", req.Email))

	// Verify OTP
	storedOTP, exists := otpStore[req.Email]
	if !exists {
		logMessage(WARN, fmt.Sprintf("resetPasswordHandler: No OTP found for email: %s", req.Email))
		http.Error(w, "Invalid or expired OTP", http.StatusUnauthorized)
		return
	}

	if storedOTP != req.OTP {
		logMessage(WARN, fmt.Sprintf("resetPasswordHandler: OTP mismatch for email: %s", req.Email))
		http.Error(w, "Invalid OTP", http.StatusUnauthorized)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("resetPasswordHandler: OTP verified for email: %s", req.Email))

	// Get user details before updating password (needed for confirmation email)
	collection := client.Database(DBName).Collection(UserCollection)
	var user RegisterUser
	filter := bson.M{"email": req.Email}

	if err := collection.FindOne(context.TODO(), filter).Decode(&user); err != nil {
		logMessage(ERROR, fmt.Sprintf("resetPasswordHandler: Failed to fetch user details: %v", err))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("resetPasswordHandler: Failed to hash password: %v", err))
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	// Update password in database
	update := bson.M{
		"$set": bson.M{
			"password": string(hashedPassword),
		},
	}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("resetPasswordHandler: Failed to update password: %v", err))
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		logMessage(WARN, fmt.Sprintf("resetPasswordHandler: No user found with email: %s", req.Email))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Remove OTP from store after successful password reset
	delete(otpStore, req.Email)
	logMessage(DEBUG, fmt.Sprintf("resetPasswordHandler: OTP removed from store for email: %s", req.Email))

	// Send confirmation email with user details and new password
	emailErr := sendPasswordResetConfirmationEmail(user, req.NewPassword)
	if emailErr != nil {
		logMessage(WARN, fmt.Sprintf("resetPasswordHandler: Failed to send confirmation email: %v", emailErr))
		// Continue even if email fails - password was already reset
	}

	// Prepare response
	response := ResetPasswordResponse{
		Message: "Password reset successfully. A confirmation email has been sent with your account details.",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		logMessage(ERROR, fmt.Sprintf("resetPasswordHandler: Error encoding response: %v", err))
		return
	}

	logMessage(INFO, fmt.Sprintf("resetPasswordHandler: Password reset successfully for email: %s", req.Email))
}
