import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import LoginForm from "./LoginForm";

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

    // ✅ PASSWORD VALIDATION (uppercase required)
    if (!/(?=.*[A-Z])/.test(password)) {
      setLoginError("Password must contain at least one uppercase letter.");
      return;
    }

    try {
      setLoading(true);
      setLoginError("");

      const response = await fetch(
        "http://13.201.125.104:5000/api/Auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // ✅ USER DATA FROM BACKEND
      const userData = {
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      };

      // ✅ SAVE SESSION
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      // ✅ NOTIFY NAVBAR
      window.dispatchEvent(
        new CustomEvent("userLoggedIn", { detail: userData })
      );

      // ✅ REDIRECT
      navigate("/dashboard");

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

