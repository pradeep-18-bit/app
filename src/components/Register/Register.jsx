import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import "../styles.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");  // ⭐ NEW (GREEN TEXT)

  const [popupMessage, setPopupMessage] = useState(""); // For server/CORS errors only

  const navigate = useNavigate();
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedValue =
      name === "name" ? value.charAt(0).toUpperCase() + value.slice(1) : value;

    setForm((prev) => ({ ...prev, [name]: updatedValue }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateField = (name, value) => {
  let message = "";

  if (name === "name" && !value.trim()) {
    message = "Name is required.";
  }

  if (name === "email") {
    if (!value.trim()) message = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      message = "Invalid email.";
  }

  if (name === "password") {
    if (!value.trim()) {
      message = "Password is required.";
    } else if (value.length < 8) {
      message = "Minimum 8 characters required.";
    } else if (!/[A-Z]/.test(value)) {
      message = "At least 1 uppercase letter required.";
    } else if (!/[0-9]/.test(value)) {
      message = "At least 1 digit required.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      message = "At least 1 special character required.";
    }
  }

  if (name === "confirmPassword") {
    if (!value.trim()) message = "Confirm password is required.";
    else if (value !== form.password) message = "Passwords do not match.";
  }

  return message;
};


  const handleBlur = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(form).forEach((field) => {
      newErrors[field] = validateField(field, form[field]);
    });

    setErrors(newErrors);

    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage(""); // clear previous
    setPopupMessage("");

    try {
      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        }
      ).catch(() => {
        throw new Error("Unable to reach the server. Please try again.");
      });

      const data = await response.json().catch(() => {
        throw new Error("Invalid server response.");
      });

      if (!response.ok) {
        if (data.message?.toLowerCase().includes("email")) {
          setErrors((prev) => ({
            ...prev,
            email: "Email already registered.",
          }));
          return;
        }

        throw new Error(data.message || "Registration failed.");
      }

      // ⭐ SUCCESS: show green text instead of popup
      setSuccessMessage("Registration successful! Redirecting to login...");

      // Optional auto-redirect
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.log("ERROR:", err.message);
      setPopupMessage(err.message); // Only for server/network errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <LeftPanel />

        <RightPanel
          form={form}
          errors={errors}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSubmit={handleSubmit}
          nameRef={nameRef}
          loading={loading}
          successMessage={successMessage} // ⭐ Pass to RightPanel
        />
      </div>
    </div>
  );
}

export default Register;
