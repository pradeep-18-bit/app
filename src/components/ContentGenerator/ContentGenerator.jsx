import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ContentTypeSelector from "./ContentTypeSelector";
import ContentConfigForm from "./ContentConfigForm";
import "../../App.css";

export default function ContentGenerator() {
  const location = useLocation();
  const template = location.state?.template || null;

  const [contentType, setContentType] = useState("Blog Post");
  const [formData, setFormData] = useState({});
  const [tone, setTone] = useState("Professional");
  const [wordCount, setWordCount] = useState(500);

  // ⭐ Generated content & typing animation
  const [generatedContent, setGeneratedContent] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const outputRef = useRef(null);

  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);

  // ⭐ ChatGPT Typing Animation
  useEffect(() => {
    if (!generatedContent) return;

    let i = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + generatedContent.charAt(i));
      i++;

      // Auto scroll as it types
      if (outputRef.current) {
        outputRef.current.scrollIntoView({ behavior: "smooth" });
      }

      if (i >= generatedContent.length) {
        clearInterval(interval);
      }
    }, 18); // typing speed

    return () => clearInterval(interval);
  }, [generatedContent]);

  // ⭐ Prefill using template
  useEffect(() => {
    if (!template) return;

    const templateCategory = (template.category || "").toLowerCase();
    const tags = Array.isArray(template.tags)
      ? template.tags.join(", ")
      : template.tags || "";

    if (templateCategory.includes("blog")) {
      setContentType("Blog Post");
      setFormData({
        title: template.title || template.Title || "",
        keywords: tags,
        outline: template.description || "",
      });
    }

    if (templateCategory.includes("social")) {
      setContentType("Social Media");
      setFormData({
        platform: template.title || "",
        hashtags: tags,
        message: template.description || "",
      });
    }

    if (templateCategory.includes("ad")) {
      setContentType("Ad Copy");
      setFormData({
        product: template.title || "",
        audience: tags,
        usp: template.description || "",
      });
    }

    if (templateCategory.includes("email")) {
      setContentType("Email Copy");
      setFormData({
        subject: template.title || "",
        recipient: tags,
        body: template.description || "",
      });
    }

    setIsTemplateLoaded(true);
  }, [template]);

  // ⭐ Load repost content (editing)
  useEffect(() => {
    const repost = localStorage.getItem("repostContent");
    if (repost) {
      const data = JSON.parse(repost);

      if (data.type) setContentType(data.type);
      if (data.tone) setTone(data.tone);
      if (data.wordCount) setWordCount(data.wordCount);

      setFormData({
        title: data.title || "",
        body: data.content || "",
      });

      localStorage.removeItem("repostContent");
    }
  }, []);

  // ⭐ Input handler
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="generator-container">
      <div className="header-card">
        <h2>Generate Content</h2>
        <p>Create amazing content with the power of AI</p>

        <div className="generator-grid">
          <ContentTypeSelector
            contentType={contentType}
            setContentType={(type) => {
              setContentType(type);
              if (!isTemplateLoaded) {
                setFormData({});
              }
            }}
          />

          <ContentConfigForm
            contentType={contentType}
            formData={formData}
            tone={tone}
            wordCount={wordCount}
            onChange={handleChange}
            setTone={setTone}
            setWordCount={setWordCount}
            setGeneratedContent={setGeneratedContent}
          />
        </div>

        {/* ⭐ ChatGPT Typing Output */}
        {generatedContent && (
          <div
            ref={outputRef}
            style={{
              marginTop: "25px",
              padding: "20px",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            <h3>✨ Generated {contentType}</h3>

            <p style={{ minHeight: "40px" }}>
              {displayedText}
              <span
                style={{
                  borderRight: "2px solid #4B6BFB",
                  marginLeft: "3px",
                  animation: "blink 0.7s infinite",
                }}
              ></span>
            </p>
          </div>
        )}
      </div>

      {/* Blinking Cursor Animation */}
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
