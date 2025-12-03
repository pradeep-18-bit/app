import React, { useState, useEffect } from "react";

export default function TemplateCard({ template, navigate }) {
  if (!template || typeof template !== "object") return null;

  const normalizeId = (obj) =>
    Number(obj.id ?? obj.Id ?? obj.templateId ?? obj._id);

  const templateId = normalizeId(template);

  const [uses, setUses] = useState(Number(template.uses) || 0);
  const [rating, setRating] = useState(Number(template.rating) || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const { title, category, description, tags } = template;

  const tagList =
    typeof tags === "string" && tags.trim() !== ""
      ? tags.split(",").map((t) => t.trim())
      : [];

  // ⭐ FIX: AUTO-UPDATE RATING WHEN TEMPLATEDETAIL SAVES RATING
  useEffect(() => {
    const handler = () => {
      const stored = JSON.parse(localStorage.getItem("templates")) || [];
      const found = stored.find((t) => normalizeId(t) === templateId);

      if (found && found.rating !== rating) {
        setRating(Number(found.rating || 0));
      }
      if (found && found.uses !== uses) {
        setUses(Number(found.uses || 0));
      }
    };

    window.addEventListener("updateTemplates", handler);

    return () => window.removeEventListener("updateTemplates", handler);
  }, [templateId, rating, uses]);

  const submitRating = async (value) => {
    setRating(value);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(
        `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/rate/${templateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ rating: value }),
        }
      );

      // ⭐ update localStorage so list + detail sync
      const stored = JSON.parse(localStorage.getItem("templates")) || [];
      const updated = stored.map((t) =>
        normalizeId(t) === templateId ? { ...t, rating: value } : t
      );
      localStorage.setItem("templates", JSON.stringify(updated));

      // ⭐ notify TemplateCard + TemplateLibrary to refresh
      window.dispatchEvent(new Event("updateTemplates"));
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  return (
    <div className="template-card">
      <span className="category-badge">{category}</span>

      <h3 className="template-title">{title}</h3>

      <p className="template-description">{description}</p>

      {/* ⭐ STAR RATING */}
      <div className="rating-row">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            className={
              (hoverRating || rating) >= num
                ? "star filled-star"
                : "star empty-star"
            }
            onClick={() => submitRating(num)}
            onMouseEnter={() => setHoverRating(num)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ★
          </span>
        ))}

        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>

      <p className="uses-count">👁 {uses} uses</p>

      <div className="tags-container">
        {tagList.length ? (
          tagList.map((tag, idx) => (
            <span key={idx} className="tag">
              {tag}
            </span>
          ))
        ) : (
          <span className="tag">No tags</span>
        )}
      </div>

      <button
        className="view-btn"
        onClick={() => navigate(`/template/${templateId}`)}
      >
        View Template →
      </button>
    </div>
  );
}
