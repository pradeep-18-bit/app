import React from "react";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import TemplatesSection from "./TemplatesSection";
import TestimonialsSection from "./TestimonialsSection";
import Footer from "./Footer";
import "../../App.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TemplatesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Dashboard;
