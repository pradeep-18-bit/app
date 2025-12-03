import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../App.css";

export default function TemplateDetail({ initialTemplates = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  // ⭐ Rating States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  /* ============================================================
      FETCH TEMPLATE
  ============================================================= */
  useEffect(() => {
    const fetchTemplateById = async () => {
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

        if (!res.ok) throw new Error("Failed to load template");

        const data = await res.json();
        setTemplate(data);

        // ⭐ Set initial rating
        setRating(Number(data.rating) || 0);
      } catch (err) {
        console.error("Fetch error:", err);

        // fallback to local
        const local = initialTemplates.find(
          (t) => Number(t.id || t.Id) === Number(id)
        );

        if (local) {
          setTemplate(local);
          setRating(Number(local.rating) || 0);
        } else {
          setError("Template not found.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateById();
  }, [id, initialTemplates]);

  /* ============================================================
      ⭐  SAVE RATING
  ============================================================= */
  const submitRating = async (value) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const templateId =
        template?.id || template?._id || template?.templateId || id;

      if (!templateId) return;

      // ⭐ Update UI
      setRating(value);
      setTemplate((prev) => ({
        ...prev,
        rating: value,
      }));

      const res = await fetch(
        `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/rate/${templateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ rating: Number(value) }),
        }
      );

      if (!res.ok) return;

      // ⭐ Update localStorage templates
      const stored = JSON.parse(localStorage.getItem("templates")) || [];
      const updated = stored.map((t) =>
        (t.id || t._id || t.templateId) == templateId
          ? { ...t, rating: Number(value) }
          : t
      );
      localStorage.setItem("templates", JSON.stringify(updated));

      // ⭐ Notify Template Library
      window.dispatchEvent(new Event("updateTemplates"));
    } catch (err) {
      console.error("Rating update error:", err);
    }
  };

  /* ============================================================
      ⭐ INCREMENT USES
  ============================================================= */
  const incrementUses = () => {
    const templateId =
      template?.id || template?._id || template?.templateId || id;

    if (!templateId) return;

    // ⭐ Update UI
    setTemplate((prev) => ({
      ...prev,
      uses: (prev.uses || 0) + 1,
    }));

    // ⭐ Update localStorage
    const stored = JSON.parse(localStorage.getItem("templates")) || [];
    const updated = stored.map((t) =>
      (t.id || t._id || t.templateId) == templateId
        ? { ...t, uses: (t.uses || 0) + 1 }
        : t
    );

    localStorage.setItem("templates", JSON.stringify(updated));
    window.dispatchEvent(new Event("updateTemplates"));
  };

  /* ============================================================
      DELETE TEMPLATE
  ============================================================= */
  const handleDelete = async () => {
    if (!window.confirm("Delete this template?")) return;

    setDeleting(true);
    setDeleteError("");
    setDeleteSuccess("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete");

      setDeleteSuccess("Template deleted!");
      window.dispatchEvent(new Event("updateTemplates"));

      setTimeout(() => navigate("/template-library"), 900);
    } catch (err) {
      setDeleteError("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================================
      UI
  ============================================================= */
  if (loading) return <p className="template-detail-loading">Loading...</p>;
  if (error) return <p className="template-detail-error">{error}</p>;

  if (!template) return <p>No template found.</p>;

  const { title, category, description, tags, uses } = template;

  const tagList = Array.isArray(tags)
    ? tags
    : typeof tags === "string" && tags.trim()
    ? tags.split(",").map((t) => t.trim())
    : [];

  return (
    <div className="template-detail-container">
      <div className="template-detail-card">
        <h2>{title}</h2>

        <p><strong>Category:</strong> {category}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>Tags:</strong> {tagList.join(", ") || "N/A"}</p>
        <p><strong>Uses:</strong> {uses || 0}</p>

        {/* ⭐ RATING UI */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <strong>Rating: </strong>

          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              onClick={() => submitRating(num)}
              onMouseEnter={() => setHoverRating(num)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                cursor: "pointer",
                fontSize: "22px",
                color:
                  (hoverRating ? hoverRating : rating) >= num
                    ? "#facc15"
                    : "#ccc",
                marginRight: 4,
              }}
            >
              ★
            </span>
          ))}

          <span style={{ marginLeft: 6 }}>{rating.toFixed(1)}</span>
        </div>

        <div className="template-detail-buttons">
          <button onClick={() => navigate("/template-library")}>
            Back to Library
          </button>

          <button
            style={{ backgroundColor: "#3d77f5", color: "white" }}
            onClick={() => {
              incrementUses();
              navigate("/content-generator", { state: { template } });
            }}
          >
            Use Template
          </button>

          <button
            style={{ backgroundColor: "#007bff", color: "white" }}
            onClick={() => navigate(`/template-edit/${id}`)}
          >
            Update Template
          </button>

          <button onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Template"}
          </button>
        </div>

        {deleteError && <p className="template-detail-error">{deleteError}</p>}
        {deleteSuccess && <p className="template-detail-success">{deleteSuccess}</p>}
      </div>
    </div>
  );
}
