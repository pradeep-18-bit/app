import React from "react";
import { useNavigate } from "react-router-dom";

const TemplatesSection = () => {
  const navigate = useNavigate();

  const templates = [
    { tag: "Blogging", title: "Blog Post Template", text: "SEO-optimized structure.", uses: "2.1k uses" },
    { tag: "E-commerce", title: "Product Description", text: "Highlight features & benefits.", uses: "1.8k uses" },
    { tag: "Email", title: "Email Newsletter", text: "Drive engagement with emails.", uses: "1.5k uses" },
    { tag: "Social", title: "Social Media Caption", text: "Catchy captions for maximum reach.", uses: "3.2k uses" },
    { tag: "Marketing", title: "Landing Page Copy", text: "High-converting page content.", uses: "987 uses" },
    { tag: "PR", title: "Press Release", text: "Professional press releases.", uses: "654 uses" },
  ];

  return (
    <div className="templates-section">
      <h2>
        Ready-Made <span>Templates</span>
      </h2>

      <p>Jump-start your content creation with our library of proven templates.</p>

      <div className="templates-grid">
        {templates.map((t, i) => (
          <div key={i} className="template-card">
            <p className="template-tag">{t.tag}</p>
            <h3>{t.title}</h3>
            <p>{t.text}</p>

            <div className="template-footer">
              <span>{t.uses}</span>

              <button onClick={() => navigate("/template-library")}>
                Use Template →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="browse-btn">
        <button onClick={() => navigate("/template-library")}>
          Browse All Templates →
        </button>
      </div>
    </div>
  );
};

export default TemplatesSection;
