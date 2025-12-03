import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./AdminDashboard.css";

const AdminLayout = () => {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Analytics", path: "/admin/analytics", icon: "📈" },
    { name: "Content Generator", path: "/admin/content-generator", icon: "🧠" },
     { name: "Content History", path: "/admin/content-history", icon: "📝" },
    { name: "Users Data", path: "/admin/users", icon: "👥" },
    { name: "History", path: "/admin/history", icon: "📜" },
    { name: "Profile", path: "/admin/profile", icon: "👤" },
  ];

  const handleRefresh = () => {
    setSpinning(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setSpinning(false), 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin Menu</h2>
        <ul className="admin-menu">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`admin-menu-item ${
                location.pathname === item.path ? "active-admin-link" : ""
              }`}
            >
              <Link to={item.path}>
                <span className="admin-icon">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Area */}
      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="admin-header-buttons">
            <button className="admin-btn logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Child Routes Render Here */}
        <main className="admin-content">
          <Outlet context={{ refreshKey }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
