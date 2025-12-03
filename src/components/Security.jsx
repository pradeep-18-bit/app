import React, { useState } from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css";
 
const Security = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleChangePassword = async () => {
    setMessage("");
    setError("");
 
    // ✅ Validate fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }
 
    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }
 
    try {
      setLoading(true);
 
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to change password.");
        setLoading(false);
        return;
      }
 
      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );
 
      // Safely parse JSON response
      let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
 
      if (res.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (!res.ok) {
        setError(data?.message || "Failed to change password.");
      } else {
        setMessage("✅ Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
<SettingsLayout>
<h3 className="settings-title">Security Settings</h3>
<p className="settings-description">Manage your account security and privacy</p>
 
      {/* Current Password */}
<div className="settings-input-group">
<label className="settings-label">Current Password</label>
<input
          type="password"
          className="settings-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
</div>
 
      {/* New Password */}
<div className="settings-input-group">
<label className="settings-label">New Password</label>
<input
          type="password"
          className="settings-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
</div>
 
      {/* Confirm Password */}
<div className="settings-input-group">
<label className="settings-label">Confirm New Password</label>
<input
          type="password"
          className="settings-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
</div>
 
      {/* Messages */}
      {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>}
      {message && <p style={{ color: "green", marginTop: "5px" }}>{message}</p>}
 
      {/* Save Button */}
<button className="settings-button" onClick={handleChangePassword} disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
</button>
</SettingsLayout>
  );
};
 
export default Security;