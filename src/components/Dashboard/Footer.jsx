import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer-cta">
        <h2>Ready to Transform Your Content Creation?</h2>
        <p>Join thousands already using AI to create content in seconds.</p>
        <div className="footer-buttons">
          <button className="btn-white">Start Creating Now →</button>
          <button className="btn-outline-white">Start Your Free Trial</button>
        </div>
        <div className="footer-info">
          <p>✅ Free 7-day trial</p>
          <p>✅ No setup fees</p>
          <p>✅ Cancel anytime</p>
        </div>
      </footer>

      <div className="footer-bottom">
        <div className="footer-brand">
          <h3>⚡ AI Content Generator</h3>
          <p>Transform your content creation with AI-powered tools.</p>
          <div className="social-icons">
            <a href="#">🐦</a>
            <a href="#">🔗</a>
            <a href="#">📷</a>
            <a href="#">✉️</a>
          </div>
        </div>
        <div className="footer-column">
          <h4>Product</h4>
          <ul><li>Features</li><li>Templates</li><li>Pricing</li><li>API</li><li>Integrations</li></ul>
        </div>
        <div className="footer-column">
          <h4>Company</h4>
          <ul><li>About</li><li>Blog</li><li>Careers</li><li>Press</li><li>Partners</li></ul>
        </div>
        <div className="footer-column">
          <h4>Support</h4>
          <ul><li>Help Center</li><li>Contact</li><li>Status</li><li>Privacy</li><li>Terms</li></ul>
        </div>
      </div>
    </>
  );
};

export default Footer;
