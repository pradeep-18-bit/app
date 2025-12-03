import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminAnalyticsDashboard() {
  const navigate = useNavigate();

  const API = "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
  const endpoints = {
    totalUsers: `${API}/total-users`,
    newSignups: `${API}/new-signups-today`,
    activeUsers: `${API}/active-users`,
    totalAdmins: `${API}/total-admins`,
    totalLogs: `${API}/total-logs`,
    mostUsedTemplates: `${API}/most-used-templates`,
    recentTemplates: `${API}/recent-templates`,
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalUsers, setTotalUsers] = useState(0);
  const [newSignups, setNewSignups] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);

  const [mostUsed, setMostUsed] = useState([]);
  const [recentTemplates, setRecentTemplates] = useState([]);

  function getToken() {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      null
    );
  }

  function logoutAndRedirect() {
    ["authToken", "token", "jwt"].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("authToken");
    navigate("/login");
  }

  async function apiGet(url) {
    try {
      const token = getToken();
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "69420",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });

      if (res.status === 401 || res.status === 403) {
        logoutAndRedirect();
        return null;
      }

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  }

  function extractNumber(obj) {
  if (obj == null) return 0;

  if (typeof obj === "number") return obj;
  if (typeof obj === "string") return Number(obj) || 0;

  const keys = [
    "count", "total", "value", "amount",
    "totalUsers", "total_users", "userCount",
    "activeUsers", "active_users", "activeusers",
    "newSignups", "signups",
    "admins", "adminCount",
    "logs", "logCount", "totalLogs"
  ];

  for (let k of keys) {
    if (obj[k] !== undefined) {
      const val = Number(obj[k]);
      return isNaN(val) ? 0 : val;
    }
  }

  // fallback: return first number found
  for (let k in obj) {
    const v = Number(obj[k]);
    if (!isNaN(v)) return v;
  }

  return 0;
}


  function extractArray(obj) {
    if (!obj || typeof obj !== "object") return [];
    if (Array.isArray(obj)) return obj;

    const keys = ["data", "items", "templates", "list", "rows", "results"];
    for (let k of keys) if (Array.isArray(obj[k])) return obj[k];

    for (let k in obj) if (Array.isArray(obj[k])) return obj[k];

    return [];
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [
          totalUsersRes,
          newSignupsRes,
          activeUsersRes,
          totalAdminsRes,
          totalLogsRes,
          mostUsedRes,
          recentRes,
        ] = await Promise.all([
          apiGet(endpoints.totalUsers),
          apiGet(endpoints.newSignups),
          apiGet(endpoints.activeUsers),
          apiGet(endpoints.totalAdmins),
          apiGet(endpoints.totalLogs),
          apiGet(endpoints.mostUsedTemplates),
          apiGet(endpoints.recentTemplates),
        ]);

        setTotalUsers(extractNumber(totalUsersRes));
        setNewSignups(extractNumber(newSignupsRes));
        setActiveUsers(extractNumber(activeUsersRes));
        setTotalAdmins(extractNumber(totalAdminsRes));

        // FIXED TOTAL LOGS (count)
        setTotalLogs(totalLogsRes?.count ?? extractNumber(totalLogsRes));

        setMostUsed(extractArray(mostUsedRes));
        setRecentTemplates(extractArray(recentRes));
      } catch {
        setError("Failed to load analytics");
      }

      setLoading(false);
    }

    load();
  }, []);

  const Card = ({ title, value, note, color }) => (
    <div className="aad-card" style={{ borderBottom: `3px solid ${color}` }}>
      <h4>{title}</h4>
      <p className="aad-value">{value}</p>
      {note && <small style={{ color: "#666" }}>{note}</small>}
    </div>
  );

  if (loading) return <div className="aad-centerText">Loading analytics...</div>;
  if (error) return <div className="aad-centerText" style={{ color: "red" }}>{error}</div>;

  return (
    <div className="aad-container">
      <h2 className="aad-title">Admin Analytics Dashboard</h2>

      {/* Top Cards */}
      <div className="aad-topCards">
        <Card title="Total Users" value={totalUsers} note={`${newSignups} new today`} color="#4f46e5" />
        <Card title="Active Users" value={activeUsers} note={`${totalUsers ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}%`} color="#10b981" />
        <Card title="Total Logs" value={totalLogs} note="+ / -" color="#f59e0b" />
        <Card title="Admins" value={totalAdmins} note={`${((totalAdmins / Math.max(1, totalUsers)) * 100).toFixed(1)}%`} color="#ef4444" />
      </div>

      {/* Content */}
      <div className="aad-contentGrid">
        <div className="aad-box">
          <h3>Most Used Templates</h3>
          <table className="aad-table">
            <thead>
              <tr>
                <th>Template</th>
                <th>Uses</th>
              </tr>
            </thead>
            <tbody>
              {mostUsed.length === 0 ? (
                <tr><td colSpan="2" style={{ textAlign: "center" }}>No templates</td></tr>
              ) : mostUsed.map((t, i) => (
                <tr key={i}>
                  <td>{t.name || t.title || "Untitled"}</td>
                  <td>{t.uses || t.count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="aad-box">
          <h3>Recently Created Templates</h3>
          <ul className="aad-list">
            {recentTemplates.length === 0 ? (
              <li>No recent templates</li>
            ) : recentTemplates.map((tpl, i) => (
              <li key={i} className="aad-listItem">
                <div className="aad-userInfo">
                  <strong>{tpl.name || tpl.title || "Untitled"}</strong>
                  <small>
                    Created: {tpl.createdAt ? new Date(tpl.createdAt).toLocaleString() : "-"} • Uses: {tpl.uses || tpl.count || 0}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
