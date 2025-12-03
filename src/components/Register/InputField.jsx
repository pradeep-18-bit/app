import React from "react";

const InputField = ({ name, type, placeholder, value, onChange, error, inputRef }) => (
  <div className="input-group">
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      ref={inputRef}
      className={`input ${error ? "error-border" : ""}`}
      autoComplete="off"
    />
    {error && <div className="error">{error}</div>}
  </div>
);

export default InputField;
