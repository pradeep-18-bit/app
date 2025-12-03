import React from "react";
import { FaBlog, FaShareAlt, FaBullhorn, FaLayerGroup } from "react-icons/fa";

const FeaturesSection = () => {
  const features = [
    { icon: <FaBlog />, title: "Blog Generation", text: "Create SEO-optimized blog posts in minutes." },
    { icon: <FaShareAlt />, title: "Social Media Posts", text: "Generate engaging posts for all platforms." },
    { icon: <FaBullhorn />, title: "Ad Copy", text: "Craft ad copies that convert and drive traffic." },
    { icon: <FaLayerGroup />, title: "Content Templates", text: "Access 100+ proven templates for all content types." },
  ];

  return (
    <div className="features-section">
      <h2>
        Everything You Need to <span>Create Amazing Content</span>
      </h2>
      <p>
        Our AI-powered platform provides all the tools you need to generate high-quality content for any purpose, at scale.
      </p>
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
