import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// ✅ Global CSS (correct path + case)
import "./components/Styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
