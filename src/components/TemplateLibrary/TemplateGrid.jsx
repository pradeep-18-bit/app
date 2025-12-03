import React from "react";
import TemplateCard from "./TemplateCard";

export default function TemplateGrid({ templates, navigate }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "25px",
        width: "100%",
      }}
    >
      {templates.map((t) => (
        <TemplateCard key={t.id || t._id} template={t} navigate={navigate} />
      ))}
    </div>
  );
}
