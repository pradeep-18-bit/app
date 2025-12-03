import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import LoginForm from "./LoginForm";
import "../styles.css";
 
export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleLogin = async (form) => {
    const { email, password } = form;
 
    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }
 
    try {
      setLoading(true);
      setLoginError("");
 
      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
 
      const data = await response.json();
      console.log("Login response:", data);
 
      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials. Please try again.");
      }
 
      const userData = {
        email: email,
        name: email.split("@")[0],
        token: data.token,
      };
 
      // ✅ Save user session
      localStorage.setItem("currentUser", JSON.stringify(userData));
 
      // ✅ Save token using the correct key
      localStorage.setItem("token", data.token);
 
      // ✅ Let Navbar update
      window.dispatchEvent(new CustomEvent("userLoggedIn", { detail: userData }));
 
      navigate("/");
 
    } catch (err) {
      setLoginError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="login-page">
      <div className="login-container">
        <LeftPanel />
        <LoginForm
          onLogin={handleLogin}
          loginError={loginError}
          loading={loading}
        />
      </div>
    </div>
  );
}