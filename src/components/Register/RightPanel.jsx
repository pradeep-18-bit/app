import React from "react";
import InputField from "./InputField";

const RightPanel = ({
  form,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
  nameRef,
  loading,
  successMessage, // ⭐ Added
}) => {
  const inputs = [
    { name: "name", type: "text", placeholder: "Name", ref: nameRef },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "password", type: "password", placeholder: "Password" },
    { name: "confirmPassword", type: "password", placeholder: "Confirm Password" },
  ];

  return (
    <div className="right-panel">
      <h2 className="loginTitle">Sign-Up</h2>

      <form onSubmit={handleSubmit} className="form">
        {inputs.map(({ name, type, placeholder, ref }) => (
          <InputField
            key={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors[name]}
            inputRef={ref}
          />
        ))}

        <button type="submit" className="signInButton" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {/* ⭐ Success message below button */}
        {successMessage && (
          <p style={{ color: "green", marginTop: "2px", fontSize: "14px" }}>
            {successMessage}
          </p>
        )}
      </form>

      <p className="footerText">
        Already registered?{" "}
        <a href="/login" className="signUpLink">Sign-In here</a>
      </p>
    </div>
  );
};

export default RightPanel;
