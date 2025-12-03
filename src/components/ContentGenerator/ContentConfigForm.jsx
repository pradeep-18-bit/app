import React, { useState } from "react";

const tones = ["Professional", "Friendly", "Conversational", "Witty"];

const configFields = {
  "Blog Post": [
    { label: "Blog Title", type: "text", key: "title" },
    { label: "Topic or Keywords", type: "text", key: "keywords" },
    { label: "Blog Description", type: "textarea", key: "outline" },
  ],
  "Social Media": [
    { label: "Platform (Facebook, Twitter etc.)", type: "text", key: "platform" },
    { label: "Hashtags", type: "text", key: "hashtags" },
    { label: "Message", type: "textarea", key: "message" },
  ],
  "Ad Copy": [
    { label: "Product/Service Name", type: "text", key: "product" },
    { label: "Target Audience", type: "text", key: "audience" },
    { label: "USP (Unique Selling Point)", type: "textarea", key: "usp" },
  ],
  "Email Copy": [
    { label: "Subject Line", type: "text", key: "subject" },
    { label: "Recipient Type", type: "text", key: "recipient" },
    { label: "Body Notes", type: "textarea", key: "body" },
  ],
};

export default function ContentConfigForm({
  contentType,
  formData,
  tone,
  wordCount,
  onChange,
  setTone,
  setWordCount,
  setGeneratedContent, // ⭐ NEW
}) {
  const [errors, setErrors] = useState({});

  const saveToHistory = (title, content) => {
    const history = JSON.parse(localStorage.getItem("contentHistory")) || [];
    const newEntry = {
      title: title || `${contentType} Content`,
      content,
      type: contentType,
      status: "Draft",
      date: new Date().toISOString(),
      wordCount: wordCount,
    };
    localStorage.setItem("contentHistory", JSON.stringify([...history, newEntry]));
  };

  const handleGenerate = async () => {
    const requiredFields = configFields[contentType] || [];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field.key] || formData[field.key].trim() === "") {
        newErrors[field.key] = `${field.label} is required.`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first.");
        return;
      }

      const promptParts = Object.keys(formData)
        .filter((key) => formData[key])
        .map((key) => `${key}: ${formData[key]}`);

      const prompt = `Generate a ${tone} ${contentType} of around ${wordCount} words based on:
      
${promptParts.join("\n")}`;

      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Content/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate content");
      }

      const generatedText =
        data.generatedContent ||
        data.content ||
        data.result ||
        data.rawResponse ||
        "";

      saveToHistory(formData.title || contentType, generatedText);

      setGeneratedContent(generatedText); // ⭐ SHOW OUTPUT BELOW THE CARD (NO UI CHANGE)
    } catch (err) {
      alert("Error generating content: " + err.message);
    }
  };

  return (
    <div className="config-card">
      <h3>Content Configuration</h3>
      <p>Customize your {contentType} settings</p>

      {configFields[contentType]?.map((field) => (
        <label key={field.key} style={{ display: "block", marginBottom: "12px" }}>
          {field.label}

          {field.type === "text" ? (
            <input
              type="text"
              value={formData[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                borderRadius: "6px",
                border: errors[field.key] ? "2px solid red" : "1px solid #ccc",
              }}
            />
          ) : (
            <textarea
              value={formData[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                minHeight: "90px",
                marginTop: "5px",
                borderRadius: "6px",
                border: errors[field.key] ? "2px solid red" : "1px solid #ccc",
              }}
            />
          )}

          {errors[field.key] && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors[field.key]}
            </span>
          )}
        </label>
      ))}

      <label style={{ marginTop: "16px", display: "block" }}>
        Tone of Voice
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "6px" }}
        >
          {tones.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label style={{ marginTop: "16px", display: "block" }}>
        Word Count: {wordCount}
        <input
          type="range"
          min={100}
          max={2000}
          value={wordCount}
          onChange={(e) => setWordCount(e.target.value)}
          style={{ width: "100%", marginTop: "5px" }}
        />
      </label>

      <button
        onClick={handleGenerate}
        style={{
          marginTop: "20px",
          padding: "10px 18px",
          background: "#4B6BFB",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ⚡ Generate {contentType}
      </button>
    </div>
  );
}
