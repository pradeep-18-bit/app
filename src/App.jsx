import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import AdminDashboardHome from "./components/AdminDashboard/AdminDashboardHome.jsx";
import AdminLayout from "./components/AdminDashboard/AdminLayout.jsx";
import AdminAnalyticsDashboard from "./components/AdminDashboard/AdminAnalyticsDashboard.jsx";
import AdminUsersData from "./components/AdminDashboard/AdminUsersData.jsx";
import AdminHistory from "./components/AdminDashboard/AdminHistory.jsx";
import AdminContentGenerator from "./components/AdminDashboard/AdminContentGenerator.jsx";
import AdminContentHistory from "./components/AdminDashboard/AdminContentHIstory.jsx";
import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import SetNewPassword from "./components/SetNewPassword.jsx";
import VerifyOtp from "./components/VerifyOtp.jsx";
import ContentGenerator from "./components/ContentGenerator/ContentGenerator.jsx";
import TemplateLibrary from "./components/TemplateLibrary/TemplateLibrary.jsx";
import TemplateDetail from "./components/TemplateLibrary/TemplateDetail.jsx";
import TemplateEdit from "./components/TemplateLibrary/TemplateEdit.jsx";
import CreateTemplate from "./components/CreateTemplate/CreateTemplate.jsx";
import ContentHistory from "./components/ContentHistory/ContentHistory.jsx";
import AdminProfile from "./components/AdminDashboard/AdminProfile.jsx";
import Pricing from "./components/Pricing/pricing.jsx";
import Profile from "./components/Profile";
import Preferences from "./components/Preferences";
import Notifications from "./components/Notifications";
import Security from "./components/Security";
import Billing from "./components/Billing";
import Api from "./components/API";
import "./App.css";

// ✅ PrivateRoute
const PrivateRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

const AppWrapper = () => {
  const location = useLocation();

  // ✅ Hide Navbar for Auth and Admin pages
  const hideNavbar =
    [
      "/login",
      "/register",
      "/reset-password",
      "/verify-otp",
      "/set-new-password",
    ].includes(location.pathname) || location.pathname.startsWith("/admin");

  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem("templates");
    return saved ? JSON.parse(saved) : [];
  });

  const addTemplate = (newTemplate) => {
    setTemplates((prev) => {
      const updated = [...prev, newTemplate];
      localStorage.setItem("templates", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {!hideNavbar && <Navbar />}
      <div style={{ marginTop: hideNavbar ? 0 : "70px" }}>
        <Routes>
<Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />

          {/* User Protected */}
          <Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>

          <Route
            path="/content-generator"
            element={
              <PrivateRoute>
                <ContentGenerator />
              </PrivateRoute>
            }
          />
          <Route
            path="/template-library"
            element={
              <PrivateRoute>
                <TemplateLibrary templates={templates} />
              </PrivateRoute>
            }
          />
          <Route
            path="/template/:id"
            element={
              <PrivateRoute>
                <TemplateDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/template-edit/:id"
            element={
              <PrivateRoute>
                <TemplateEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-template"
            element={
              <PrivateRoute>
                <CreateTemplate addTemplate={addTemplate} />
              </PrivateRoute>
            }
          />
          <Route
            path="/content-history"
            element={
              <PrivateRoute>
                <ContentHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/preferences"
            element={
              <PrivateRoute>
                <Preferences />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/security"
            element={
              <PrivateRoute>
                <Security />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/billing"
            element={
              <PrivateRoute>
                <Billing />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/api"
            element={
              <PrivateRoute>
                <Api />
              </PrivateRoute>
            }
          />

          {/* ✅ Admin Layout */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboardHome />} />
            <Route path="dashboard" element={<AdminDashboardHome />} />
            <Route path="analytics" element={<AdminAnalyticsDashboard />} />
            <Route
              path="content-generator"
              element={<AdminContentGenerator/>}
            />
            <Route path="/admin/content-history" element={<AdminContentHistory />} />
            <Route path="users" element={<AdminUsersData />} />
            <Route path="history" element={<AdminHistory/>} />
            <Route path="profile" element={<AdminProfile/>} />
          </Route>

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
