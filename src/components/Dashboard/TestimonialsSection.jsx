import React from "react";

const TestimonialsSection = () => {
  const testimonials = [
    { text: "This AI tool transformed our content strategy.", name: "Sarah Chen", role: "Marketing Manager", company: "TechFlow Inc." },
    { text: "Social engagement increased 300% using this tool.", name: "Marcus Rodriguez", role: "Director", company: "Growth Labs" },
    { text: "I can handle more clients now as a freelancer.", name: "Emily Johnson", role: "Writer", company: "ContentCraft" },
  ];

  return (
    <div className="testimonials-section">
      <h2>
        Trusted by <span>Thousands</span>
      </h2>
      <p>See what content creators, marketers, and businesses say about our AI tools.</p>
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>{t.text}</p>
            <strong>{t.name}</strong>
            <p className="role">{t.role}</p>
            <p className="company">{t.company}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
