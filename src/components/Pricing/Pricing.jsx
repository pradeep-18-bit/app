import React from "react";
import "./Pricing.css"; // Make sure your CSS file is linked

const Pricing = () => {
  return (
    <div className="pricing-container">
      <h2 className="pricing-title">Simple, Transparent Pricing</h2>
      <p className="pricing-subtitle">
        Choose the perfect plan for your content generation needs. Start free and scale as you grow.
      </p>

      <div className="pricing-cards">
        {/* Starter Plan */}
        <div className="pricing-card">
          <h3>Starter</h3>
          <p className="plan-price">
            Free <span>/forever</span>
          </p>
          <button className="btn btn-free">Get Started Free</button>
          <ul>
            <li>5 content generations per month</li>
            <li>Basic templates</li>
            <li>Blog posts & social media</li>
            <li>Email support</li>
            <li>Basic analytics</li>
          </ul>
        </div>

        {/* Professional Plan */}
        <div className="pricing-card popular">
          <div className="badge">Most Popular</div>
          <h3>Professional</h3>
          <p className="plan-price">
            $29 <span>/per month</span>
          </p>
          <p className="plan-description">Ideal for content creators and small teams</p>
          <button className="btn btn-pro">Start Pro Trial</button>
          <ul>
            <li>Unlimited content generation</li>
            <li>Premium templates library</li>
            <li>All content types</li>
            <li>Priority email support</li>
            <li>Advanced analytics</li>
            <li>Export to multiple formats</li>
            <li>Brand voice customization</li>
            <li>Team collaboration (up to 3 users)</li>
          </ul>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card">
          <h3>Enterprise</h3>
          <p className="plan-price">
            $99 <span>/per month</span>
          </p>
          <p className="plan-description">For large teams and businesses</p>
          <button className="btn btn-enterprise">Contact Sales</button>
          <ul>
            <li>Everything in Professional</li>
            <li>Unlimited team members</li>
            <li>Custom templates</li>
            <li>API access</li>
            <li>Dedicated account manager</li>
            <li>Priority phone support</li>
            <li>Custom integrations</li>
            <li>Advanced security features</li>
            <li>White-label options</li>
            <li>Custom AI model training</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
