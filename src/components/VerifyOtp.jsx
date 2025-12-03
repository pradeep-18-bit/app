import React, { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import "./Styles.css";
 
function VerifyOtp() {

  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");

  const [confirm, setConfirm] = useState("");
 
  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
 
  const location = useLocation();

  const navigate = useNavigate();

  const email = location.state?.email;
 
  useEffect(() => {

    if (!email) navigate("/reset-password");

  }, [email, navigate]);
 
  const handleOtpChange = (value) => {

    setOtp(value);

    if (value.trim() !== "") setError("");

  };
 
  const handlePasswordChange = (value) => {

    setPassword(value);

    setError("");

  };
 
  const handleConfirmChange = (value) => {

    setConfirm(value);

    setError("");

  };
 
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");
 
    if (!otp.trim()) return setError("OTP is required.");

    if (!password.trim()) return setError("Password is required.");

    if (password.length < 6)

      return setError("Password must be at least 6 characters.");

    if (password !== confirm)

      return setError("Passwords do not match.");
 
    setLoading(true);
 
    try {

      const response = await fetch(

        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/reset-password",

        {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({

            otp: otp,               // 🔥 FIXED FIELD NAME

            newPassword: password,  // backend expects "NewPassword"

          }),

        }

      );
 
      const data = await response.json();

      if (!response.ok)

        throw new Error(data.message || "Failed to reset password.");
 
      setSuccess("Password reset successful! Redirecting...");

      setOtp("");

      setPassword("");

      setConfirm("");
 
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {

      setError(err.message || "Something went wrong.");

    } finally {

      setLoading(false);

    }

  };
 
  return (
<div className="verify-otp-page">
<div className="verify-otp-panel">
  <div className="verify-back-arrow" onClick={() => navigate(-1)}>← Back</div>

  <h2 className="verify-otp-title">Verify OTP & Set New Password</h2>

        <form onSubmit={handleSubmit} className="verify-otp-form">
<div className="verify-otp-input-group">
<input

              type="text"

              placeholder="Enter OTP"

              value={otp}

              onChange={(e) => handleOtpChange(e.target.value)}

              disabled={loading}

              className="verify-otp-input"

            />
</div>
 
          <div className="verify-otp-input-group">
<input

              type="password"

              placeholder="New Password"

              value={password}

              onChange={(e) => handlePasswordChange(e.target.value)}

              disabled={loading}

              className="verify-otp-input"

            />
</div>
 
          <div className="verify-otp-input-group">
<input

              type="password"

              placeholder="Confirm Password"

              value={confirm}

              onChange={(e) => handleConfirmChange(e.target.value)}

              disabled={loading}

              className="verify-otp-input"

            />
</div>
 
          {error && <div className="verify-otp-error">{error}</div>}

          {success && <div className="verify-otp-success">{success}</div>}
 
          <button type="submit" className="verify-otp-button" disabled={loading}>

            {loading ? "Processing..." : "Reset Password"}
</button>
</form>
</div>
</div>

  );

}
 
export default VerifyOtp;