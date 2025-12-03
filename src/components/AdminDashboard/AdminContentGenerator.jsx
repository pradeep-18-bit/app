import React, { useState, useEffect } from "react";
import { FaRegFileAlt, FaShareAlt, FaBullhorn, FaEnvelope } from "react-icons/fa";
import "./AdminDashboard.css";

const adminContentTypes = [
  { key: "Blog Post", title: "Blog Post", description: "SEO-optimized articles", icon: FaRegFileAlt, color: "#6b46ff" },
  { key: "Social Media", title: "Social Media", description: "Engaging posts", icon: FaShareAlt, color: "#ff6b6b" },
  { key: "Ad Copy", title: "Ad Copy", description: "High-converting ads", icon: FaBullhorn, color: "#00b894" },
  { key: "Email Copy", title: "Email Copy", description: "Professional email campaigns", icon: FaEnvelope, color: "#0984e3" },
];

const adminContentTones = ["Professional", "Friendly", "Conversational", "Witty"];

const adminContentFields = {
  "Blog Post": [
    { label: "Blog Title", type: "text", key: "title" },
    { label: "Topic or Keywords", type: "text", key: "keywords" },
    { label: "Blog Description", type: "textarea", key: "outline" },
  ],
  "Social Media": [
    { label: "Platform", type: "text", key: "platform" },
    { label: "Hashtags", type: "text", key: "hashtags" },
    { label: "Message", type: "textarea", key: "message" },
  ],
  "Ad Copy": [
    { label: "Product/Service Name", type: "text", key: "product" },
    { label: "Target Audience", type: "text", key: "audience" },
    { label: "USP", type: "textarea", key: "usp" },
  ],
  "Email Copy": [
    { label: "Subject Line", type: "text", key: "subject" },
    { label: "Recipient Type", type: "text", key: "recipient" },
    { label: "Body Notes", type: "textarea", key: "body" },
  ],
};

/* ============================================================
   Content Type Selector Component
============================================================= */
const AdminContentTypeSelector = ({ contentTypes, contentType, setContentType, setFormData, setErrors }) => {
  const typeCardClass = (type) =>
    contentType === type ? "adminContentTypeCard adminContentTypeCardActive" : "adminContentTypeCard";

  return (
    <div className="adminContentTypeCardContainer">
      <h3>Choose Content Type</h3>
      <p>Select the type of content you want to generate</p>

      {contentTypes.map((type) => {
        const Icon = type.icon;
        return (
          <div
            key={type.key}
            className={typeCardClass(type.key)}
            onClick={() => {
              setContentType(type.key);
              setFormData({});
              setErrors({});
            }}
          >
            <div className="adminContentTypeCardIcon" style={{ backgroundColor: type.color }}>
              <Icon size={24} />
            </div>

            <div>
              <strong className="adminContentTypeCardTitle">{type.title}</strong>
              <div className="adminContentTypeCardText">{type.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   Configuration Form Component
============================================================= */
const AdminConfigForm = ({
  configFields,
  formData,
  handleChange,
  tone,
  setTone,
  tones,
  wordCount,
  setWordCount,
  contentType,
  handleGenerate,
  loading,
  errors,
}) => {
  return (
    <div className="adminContentConfigCard">
      <h3>Content Configuration</h3>
      <p>Customize your {contentType} settings</p>

      {configFields.map((field) => (
        <label key={field.key} className="adminContentConfigFieldLabel">
          {field.label}
          {field.type === "text" ? (
            <input
              type="text"
              value={formData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={`adminContentConfigFieldInput ${errors[field.key] ? "input-error" : ""}`}
            />
          ) : (
            <textarea
              value={formData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={`adminContentConfigFieldTextarea ${errors[field.key] ? "input-error" : ""}`}
            />
          )}
          {errors[field.key] && <div className="error-text">{errors[field.key]}</div>}
        </label>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
        <label style={{ fontSize: "13px", color: "#333" }}>
          Tone of Voice
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="adminContentConfigFieldSelect">
            {tones.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label style={{ fontSize: "13px", color: "#333" }}>
          Word Count: {wordCount} words
          <input
            type="range"
            min={100}
            max={2000}
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            className="adminContentConfigFieldRange"
          />
        </label>
      </div>

      <button className="adminContentGenerateButton" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : `⚡ Generate ${contentType}`}
      </button>
    </div>
  );
};

/* ============================================================
   MAIN PAGE COMPONENT
============================================================= */
export default function AdminContentGeneratorPage() {
  const [contentType, setContentType] = useState("Blog Post");
  const [formData, setFormData] = useState({});
  const [tone, setTone] = useState("Professional");
  const [wordCount, setWordCount] = useState(500);
  const [generatedContent, setGeneratedContent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ⭐ Typing animation states
  const [typedText, setTypedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);

  // ⭐ SAVE TO HISTORY FUNCTION
  const saveToHistory = (title, content) => {
    const oldHistory = JSON.parse(localStorage.getItem("adminContentHistory")) || [];

    const newItem = {
      title,
      type: contentType,
      status: "Published",
      wordCount,
      date: new Date().toISOString(),
      content,
    };

    oldHistory.unshift(newItem);
    localStorage.setItem("adminContentHistory", JSON.stringify(oldHistory));
  };

  // ⭐ Typing animation effect
  useEffect(() => {
    if (!generatedContent) return;

    if (typingIndex < generatedContent.length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + generatedContent[typingIndex]);
        setTypingIndex((prev) => prev + 1);
      }, 15);

      return () => clearTimeout(timeout);
    }
  }, [generatedContent, typingIndex]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /* ============================================================
     HANDLE GENERATE
  ============================================================= */
  const handleGenerate = async () => {
    const newErrors = {};
    adminContentFields[contentType].forEach((field) => {
      if (!formData[field.key] || formData[field.key].trim() === "") {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    let prompt = `Write a ${tone.toLowerCase()} ${contentType.toLowerCase()} of approx ${wordCount} words.\n`;

    switch (contentType) {
      case "Blog Post":
        prompt += `Title: ${formData.title}\nKeywords: ${formData.keywords}\nOutline: ${formData.outline}`;
        break;
      case "Social Media":
        prompt += `Platform: ${formData.platform}\nHashtags: ${formData.hashtags}\nMessage: ${formData.message}`;
        break;
      case "Ad Copy":
        prompt += `Product: ${formData.product}\nAudience: ${formData.audience}\nUSP: ${formData.usp}`;
        break;
      case "Email Copy":
        prompt += `Subject: ${formData.subject}\nRecipient: ${formData.recipient}\nBody: ${formData.body}`;
        break;
    }

    setLoading(true);
    setGeneratedContent("");
    setTypedText("");
    setTypingIndex(0);

    try {
      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Content/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: contentType, tone, wordCount, Prompt: prompt }),
        }
      );

      const result = await response.json();
      const text = (result.content || result.result || "No content returned from API").toString();

      setGeneratedContent(text);

      // ⭐ SAVE to history here
      saveToHistory(formData.title || formData.subject || formData.product || "Untitled", text);

    } catch (err) {
      alert("Error generating content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     UI RETURN
  ============================================================= */
  return (
    <div
      className="adminContentContainer"
      style={{
        border: "2px solid #6b46ff",
        borderRadius: "12px",
        padding: "10px",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginLeft: "100px",
        marginTop: "30px",
      }}
    >
      <h3 className="adminContentTitle">Generate Content</h3>
      <p className="adminContentSubtitle">Create amazing content with the power of AI</p>

      <div className="adminContentFlex">
        <AdminContentTypeSelector
          contentTypes={adminContentTypes}
          contentType={contentType}
          setContentType={setContentType}
          setFormData={setFormData}
          setErrors={setErrors}
        />

        <AdminConfigForm
          configFields={adminContentFields[contentType]}
          formData={formData}
          handleChange={handleChange}
          tone={tone}
          setTone={setTone}
          tones={adminContentTones}
          wordCount={wordCount}
          setWordCount={setWordCount}
          contentType={contentType}
          handleGenerate={handleGenerate}
          loading={loading}
          errors={errors}
        />
      </div>

      {loading && <p>⚡ Generating content...</p>}

      {generatedContent && !loading && (
        <div className="adminGeneratedContent">
          <h4>Generated {contentType}:</h4>
          <div className="generatedContentBox">
            <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{typedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
