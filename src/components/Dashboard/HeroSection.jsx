import React from "react";

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-text">
        <h1>
          Generate Content in <span>Seconds</span>
        </h1>
        <p>
          Create high-quality blog posts, social media content, and ad copy instantly with our AI-powered content generation platform.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Try for Free</button>
          <button className="btn-outline">Watch Demo</button>
        </div>
      </div>
      <div className="hero-image">
        <img
          src="https://img.freepik.com/free-vector/hand-drawn-flat-design-homepage-illustration_23-2149233374.jpg?semt=ais_hybrid&w=740"
          alt="Illustration"
        />
      </div>
    </div>
  );
};

export default HeroSection;
