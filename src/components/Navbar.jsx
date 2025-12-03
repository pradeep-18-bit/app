import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) setUser(storedUser);

    const handleLogin = (e) => {
      setUser(e.detail);
    };

    window.addEventListener("userLoggedIn", handleLogin);
    return () => window.removeEventListener("userLoggedIn", handleLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");

    setUser(null);
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/settings/profile");
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimeoutRef.current);
    setShowLogout(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowLogout(false);
    }, 1000);
  };

  // ⭐ FIXED USERNAME (ONLY THIS CHANGED)
  const displayName = user?.fullName || "User";

  return (
    <nav className="navbar">
      <div className="navbar-logo">AI Content Generator</div>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/content-generator">Content Generator</Link>
        <Link to="/template-library">Templates</Link>
        <Link to="/content-history">Content History</Link>
        <Link to="/Pricing">Pricing</Link>
        {user && <Link to="/settings/profile">Settings</Link>}
      </div>

      {/* PROFILE SECTION */}
      <div
        className="profile-section"
        onClick={handleProfileClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", cursor: "pointer" }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="User"
          className="navbar-profile-small"
        />

        <span className="navbar-username-below">{displayName}</span>

        {showLogout && (
          <div className="profile-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
