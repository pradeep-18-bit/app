import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TemplateControls from "./TemplateControls";
import TemplateGrid from "./TemplateGrid";
import "../../App.css";

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ⭐ Merge backend templates with saved local uses
  const mergeLocalUses = (serverList) => {
    const local = JSON.parse(localStorage.getItem("templates")) || [];

    return serverList.map((s) => {
      const found = local.find((l) => Number(l.id) === Number(s.id));
      return found ? { ...s, uses: found.uses } : s;
    });
  };

  // ⭐ Fetch templates from server
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (!res.ok) throw new Error("Error fetching templates");

      const data = await res.json();

      const formatted = data.map((t, i) => ({
        id: t.id ?? t.templateId ?? i + 1,
        title: t.title ?? "Untitled",
        description: t.description ?? "",
        category: t.category ?? "General",
        tags: t.tags ?? "",
        rating: t.rating ?? 0,
        uses: t.uses ?? 0,
      }));

      const merged = mergeLocalUses(formatted);
      setTemplates(merged);

      localStorage.setItem("templates", JSON.stringify(merged));
    } catch (err) {
      console.error(err);
      setError("Unable to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Search + Filter
  const filtered = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" || t.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="template-library-container">
      <div className="template-library">
        <h2>Template Library</h2>
        <TemplateControls
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
        />

        {loading ? (
          <p>Loading templates...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filtered.length ? (
          <TemplateGrid templates={filtered} navigate={navigate} />
        ) : (
          <p>No templates found.</p>
        )}
      </div>
    </div>
  );
}
