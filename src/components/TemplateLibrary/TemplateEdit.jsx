import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TemplateFormEdit.css";

export default function TemplateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uses, setUses] = useState(0);
  const [rating, setRating] = useState(0);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/${id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );

        const data = await res.json();

        setTitle(data.title || data.Title || "");
        setCategory(data.category || data.Category || "");
        setDescription(data.description || data.Description || "");

        const rawTags = data.tags || data.Tags || [];
        setTags(Array.isArray(rawTags) ? rawTags.join(", ") : rawTags);

        setUses(data.uses ?? data.Uses ?? 0);
        setRating(data.rating ?? data.Rating ?? 0);
      } catch (err) {
        console.error("Error loading template:", err);
        navigate("/template-library");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!title.trim()) validationErrors.title = "Title is required";
    if (!category) validationErrors.category = "Category is required";
    if (!description.trim()) validationErrors.description = "Description is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({
            title,
            category,
            description,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t !== ""),
            uses: Number(uses),
            rating: Number(rating),
          }),
        }
      );

      navigate("/template-library");
    } catch (err) {
      console.error("Error updating template:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading...
      </p>
    );

  return (
    <div className="form-container">
      <form className="form-card" onSubmit={handleUpdate}>
        <h2>Edit Template</h2>

        {/* Title */}
        <input
          className={`form-input ${errors.title ? "error" : ""}`}
          value={title}
          placeholder="Template Title *"
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors({ ...errors, title: "" });
          }}
        />
        <span className="error-text">{errors.title}</span>

        {/* Category */}
        <select
          className={`form-select ${errors.category ? "error" : ""}`}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setErrors({ ...errors, category: "" });
          }}
        >
          <option value="">Select Category *</option>
          <option value="Blogging">Blogging</option>
          <option value="E-commerce">E-commerce</option>
          <option value="Email Marketing">Email Marketing</option>
          <option value="Social Media">Social Media</option>
          <option value="Marketing">Marketing</option>
          <option value="PR">PR</option>
          <option value="Video Content">Video Content</option>
          <option value="Advertising">Advertising</option>
          <option value="Business">Business</option>
        </select>
        <span className="error-text">{errors.category}</span>

        {/* Description */}
        <textarea
          className={`form-textarea ${errors.description ? "error" : ""}`}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors({ ...errors, description: "" });
          }}
          placeholder="Description *"
        />
        <span className="error-text">{errors.description}</span>

        {/* Tags */}
        <input
          className="form-input"
          value={tags}
          placeholder="Tags (comma separated)"
          onChange={(e) => setTags(e.target.value)}
        />

        {/* Uses */}
        <input
          className="form-input"
          type="number"
          value={uses}
          placeholder="Uses"
          onChange={(e) => setUses(e.target.value)}
        />

        {/* Rating */}
        <input
          className="form-input"
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={rating}
          placeholder="Rating"
          onChange={(e) => setRating(e.target.value)}
        />

        <button className="submit-btn" disabled={saving} type="submit">
          {saving ? "Updating..." : "Update Template"}
        </button>
      </form>
    </div>
  );
}
