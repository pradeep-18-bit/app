import React from "react";
import { useNavigate } from "react-router-dom";

export default function TemplateControls({ search, setSearch, filter, setFilter }) {
  const navigate = useNavigate();

  return (
    <div className="controls">
      <input
        type="text"
        placeholder="🔍 Search templates..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option>All</option>
        <option>Blogging</option>
        <option>E-commerce</option>
        <option>Email Marketing</option>
        <option>Social Media</option>
        <option>Marketing</option>
        <option>PR</option>
        <option>Video Content</option>
        <option>Advertising</option>
        <option>Business</option>
      </select>
      <button className="create-template-btn" onClick={() => navigate("/create-template")}>
        + Create Template
      </button>
    </div>
  );
}
