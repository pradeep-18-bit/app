import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // VALIDATION
  const validate = (field, value) => {
  let msg = "";

  if (field === "fullName") {
    if (!value.trim()) msg = "Full name is required.";
    else if (value.trim().length < 3)
      msg = "Full name must be at least 3 characters.";
  }

  if (field === "email") {
    if (!value.trim()) msg = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      msg = "Enter a valid email.";
  }

  if (field === "password") {
    if (!value.trim()) {
      msg = "Password is required.";
    } else if (value.length < 8) {
      msg = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(value)) {
      msg = "Password must contain at least 1 uppercase letter.";
    } else if (!/[0-9]/.test(value)) {
      msg = "Password must contain at least 1 digit.";
    } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value)) {
      msg = "Password must contain at least 1 special character.";
    }
  }

  return msg;
};


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: validate(name, value),
    }));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: validate("email", form.email),
      password: validate("password", form.password),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((v) => v !== "")) return;

    setLoading(true);
    setLoginError("");

    // ADMIN VALIDATION
    if (selectedRole === "admin") {
      if (
        form.email !== "naineneeraja@gmail.com" ||
        form.password !== "123457869"
      ) {
        setLoginError("Invalid admin credentials");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      // ADMIN CHECK
      const isAdmin =
        selectedRole === "admin" &&
        form.email === "naineneeraja@gmail.com" &&
        form.password === "123457869";

      // Store user
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: form.email,
          role: isAdmin ? "admin" : "user",
        })
      );

      if (isAdmin) navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setLoginError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="right-panel">
      <h2 className="login-title">Sign In</h2>
      <p className="login-subtitle">
        Welcome back! Please login to your account.
      </p>

      {/* ROLE SELECTION */}
      <div className="role-selection">
        <div
          className={`role-card ${selectedRole === "user" ? "active" : ""}`}
          onClick={() => setSelectedRole("user")}
        >
          <h3>User</h3>
        </div>

        <div
          className={`role-card ${selectedRole === "admin" ? "active" : ""}`}
          onClick={() => setSelectedRole("admin")}
        >
          <h3>Admin</h3>
        </div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {/* EMAIL */}
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input ${errors.email ? "error-border" : ""}`}
            disabled={loading}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        {/* PASSWORD */}
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input ${errors.password ? "error-border" : ""}`}
            disabled={loading}
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        {/* API ERROR */}
        {loginError && <div className="login-error">{loginError}</div>}

        {/* OPTIONS */}
        <div className="options">
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox" disabled={loading} />{" "}
            Remember me
          </label>

          <span
            className="forgot-password"
            onClick={() => !loading && navigate("/reset-password")}
          >
            Forgot password?
          </span>
        </div>

        {/* SIGN IN BUTTON */}
        <button type="submit" className="sign-in-button" disabled={loading}>
          {loading ? "Logging in..." : "Sign In"}
        </button>

        {/* SIGN UP */}
        <div className="signup" style={{ textAlign: "center", marginTop: "10px" }}>
          Don’t have an account?{" "}
          <a
            href="#"
            className="sign-up-link"
            onClick={(e) => {
              e.preventDefault();
              if (!loading) navigate("/register");
            }}
          >
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
