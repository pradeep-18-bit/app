import React from "react";
import { FaRegFileAlt, FaShareAlt, FaBullhorn, FaEnvelope } from "react-icons/fa";

const contentTypes = [
  {
    key: "Blog Post",
    title: "Blog Post",
    description: "SEO-optimized articles and blog content",
    icon: <FaRegFileAlt />,
    color: "#6b46ff",
  },
  {
    key: "Social Media",
    title: "Social Media",
    description: "Engaging posts for all platforms",
    icon: <FaShareAlt />,
    color: "#ff6b6b",
  },
  {
    key: "Ad Copy",
    title: "Ad Copy",
    description: "High-converting advertising content",
    icon: <FaBullhorn />,
    color: "#00b894",
  },
  {
    key: "Email Copy",
    title: "Email Copy",
    description: "Professional email campaigns",
    icon: <FaEnvelope />,
    color: "#0984e3",
  },
];

export default function ContentTypeSelector({ contentType, setContentType, setFormData }) {
  return (
    <div className="content-type-card">
      <h3>Choose Content Type</h3>
      <p>Select the type of content you want to generate</p>
      {contentTypes.map((type) => (
        <div
          key={type.key}
          className={`type-card ${contentType === type.key ? "active" : ""}`}
          onClick={() => {
            setContentType(type.key);
            setFormData({});
          }}
        >
          <div className="type-icon" style={{ backgroundColor: type.color }}>
            {type.icon}
          </div>
          <div>
            <strong>{type.title}</strong>
            <div className="type-description">{type.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
