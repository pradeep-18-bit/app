import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboardHome() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newSignups: 0,
    totalRevenue: 0,
    bounceRate: 0,
    avgSession: 0,
  });

  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState("");

  const [selectedCard, setSelectedCard] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  function getStoredToken() {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      sessionStorage.getItem("authToken") ||
      null
    );
  }

  const API_BASE =
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
  const endpoints = {
    totalUsers: `${API_BASE}/total-users`,
    newSignupsToday: `${API_BASE}/new-signups-today`,
    // use active-users-list for active users
    activeUsers: `${API_BASE}/active-users-list`,
    totalRevenue: `${API_BASE}/total-revenue`,
    bounceRate: `${API_BASE}/bounce-rate`,
    avgSession: `${API_BASE}/avg-session`,
    usersTable: `${API_BASE}/users-table`,
  };

  function handleAuthFailure(res) {
    if (!res) return false;
    if (res.status === 401 || res.status === 403) {
      ["authToken", "token", "jwt", "userToken"].forEach((k) =>
        localStorage.removeItem(k)
      );
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("token");
      setTimeout(() => navigate("/login"), 800);
      return true;
    }
    return false;
  }

  async function readResponseSafely(res) {
    if (handleAuthFailure(res)) {
      return { ok: false, error: "Unauthorized", raw: "", status: res.status };
    }
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    if (
      contentType.includes("application/json") ||
      contentType.includes("json")
    ) {
      try {
        return { ok: true, json: JSON.parse(text), raw: text, status: res.status };
      } catch (err) {
        return { ok: false, error: "Invalid JSON", raw: text, status: res.status };
      }
    }
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return { ok: true, json: parsed, raw: text, status: res.status };
      } catch (e) {
        /* fall through */
      }
    }
    return { ok: false, error: "Non-JSON response", raw: text, status: res.status };
  }

  function deepExtractNumber(jsonOrValue) {
    if (jsonOrValue == null) return null;
    if (typeof jsonOrValue === "number") return jsonOrValue;
    if (typeof jsonOrValue === "string") {
      const trimmed = jsonOrValue.trim();
      const n = Number(trimmed);
      if (!Number.isNaN(n)) return n;
      const m = trimmed.match(/-?\d+(?:\.\d+)?/);
      return m ? Number(m[0]) : null;
    }
    if (Array.isArray(jsonOrValue)) return jsonOrValue.length;
    if (typeof jsonOrValue === "object") {
      const candidates = [
        "value",
        "count",
        "total",
        "totalUsers",
        "total_users",
        "users",
        "size",
        "length",
        "countUsers",
        "activeUsers",
        "active_users",
      ];
      for (const k of candidates) {
        if (jsonOrValue[k] != null) {
          const v = deepExtractNumber(jsonOrValue[k]);
          if (v != null) return v;
        }
      }
      for (const k of Object.keys(jsonOrValue)) {
        const v = jsonOrValue[k];
        if (Array.isArray(v)) return v.length;
      }
      for (const k of Object.keys(jsonOrValue)) {
        try {
          const v = deepExtractNumber(jsonOrValue[k]);
          if (v != null) return v;
        } catch (_) {}
      }
    }
    return null;
  }

  function extractArrayFromWrappedObject(obj) {
    if (!obj || typeof obj !== "object") return null;
    const arrayKeys = ["data", "users", "items", "results", "rows", "list"];
    for (const k of arrayKeys) if (Array.isArray(obj[k])) return obj[k];
    for (const key of Object.keys(obj)) if (Array.isArray(obj[key])) return obj[key];
    return null;
  }

  // fetch stats
  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      setCardsLoading(true);
      setCardsError("");
      const token = getStoredToken();
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "69420",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        const fetches = await Promise.all([
          fetch(endpoints.totalUsers, { headers }),
          fetch(endpoints.newSignupsToday, { headers }),
          fetch(endpoints.activeUsers, { headers }), // now hits active-users-list
          fetch(endpoints.totalRevenue, { headers }),
          fetch(endpoints.bounceRate, { headers }),
          fetch(endpoints.avgSession, { headers }),
        ]);

        const authFail = fetches.find(
          (r) => r && (r.status === 401 || r.status === 403)
        );
        if (authFail) {
          handleAuthFailure(authFail);
          setCardsError("Authentication required. Redirecting to login...");
          return;
        }

        const parsed = await Promise.all(
          fetches.map((r) => readResponseSafely(r))
        );

        const values = parsed.map((p) => {
          try {
            if (p.ok) return deepExtractNumber(p.json);
            const raw = p.raw;
            if (typeof raw === "string") {
              const t = raw.trim();
              if (t.startsWith("{") || t.startsWith("[")) {
                try {
                  const parsedRaw = JSON.parse(t);
                  return deepExtractNumber(parsedRaw);
                } catch (_) {}
              }
              return deepExtractNumber(raw);
            }
            return deepExtractNumber(p.raw);
          } catch (_) {
            return null;
          }
        });

        if (!mounted) return;

        setStats((s) => ({
          ...s,
          totalUsers: values[0] ?? s.totalUsers,
          newSignups: values[1] ?? s.newSignups,
          activeUsers: values[2] ?? s.activeUsers,
          totalRevenue: values[3] ?? s.totalRevenue,
          bounceRate: values[4] ?? s.bounceRate,
          avgSession: values[5] ?? s.avgSession,
        }));
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        if (mounted)
          setCardsError(
            "Failed to load dashboard stats. See console/network for details."
          );
      } finally {
        if (mounted) setCardsLoading(false);
      }
    }

    fetchStats();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const colors = [
    "linear-gradient(135deg, #3b82f6, #60a5fa)",
    "linear-gradient(135deg, #10b981, #34d399)",
    "linear-gradient(135deg, #f59e0b, #fbbf24)",
    "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    "linear-gradient(135deg, #ef4444, #f87171)",
    "linear-gradient(135deg, #06b6d4, #22d3ee)",
  ];

  const cards = [
    { label: "Total Users", key: "totalUsers", value: stats.totalUsers, note: "+ / -" },
    { label: "Active Users", key: "activeUsers", value: stats.activeUsers, note: "last 24h" },
    { label: "New Signups Today", key: "newSignups", value: stats.newSignups, note: "today" },
    { label: "Total Revenue ($)", key: "totalRevenue", value: stats.totalRevenue, note: "static" },
    { label: "Bounce Rate (%)", key: "bounceRate", value: stats.bounceRate, note: "static" },
    { label: "Avg. Session (min)", key: "avgSession", value: stats.avgSession, note: "avg" },
  ];

  // handle card click
  const handleCardClick = useCallback(
    async (label, key) => {
      setSelectedCard(label);
      setSearchTerm("");
      setFilterDateFrom("");
      setFilterDateTo("");
      setDetailData([]);
      setDetailError("");

      const token = getStoredToken();
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "69420",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      setDetailLoading(true);

      try {
        if (key === "activeUsers" || key === "newSignups" || key === "totalUsers") {
          const specificEndpoint =
            key === "newSignups"
              ? endpoints.newSignupsToday
              : key === "activeUsers"
              ? endpoints.activeUsers      // -> active-users-list
              : endpoints.totalUsers;

          const specificRes = await fetch(specificEndpoint, { headers });
          if (handleAuthFailure(specificRes)) {
            setDetailError("Authentication required. Redirecting to login...");
            return;
          }
          const specificParsed = await readResponseSafely(specificRes);

          // 1) array -> use it
          if (
            specificParsed.ok &&
            Array.isArray(specificParsed.json) &&
            specificParsed.json.length > 0
          ) {
            setDetailData(specificParsed.json);
            return;
          }

          // 2) wrapped array
          if (specificParsed.ok && typeof specificParsed.json === "object") {
            const arr = extractArrayFromWrappedObject(specificParsed.json);
            if (arr && arr.length > 0) {
              setDetailData(arr);
              return;
            }
            const isLikelySummary =
              deepExtractNumber(specificParsed.json) != null &&
              !Array.isArray(specificParsed.json);
            if (!isLikelySummary) {
              if (Object.keys(specificParsed.json).length > 0) {
                setDetailData([specificParsed.json]);
                return;
              }
            }
          }

          // 3) fallback to users table
          const usersRes = await fetch(endpoints.usersTable, { headers });
          if (handleAuthFailure(usersRes)) {
            setDetailError("Authentication required. Redirecting to login...");
            return;
          }
          const usersParsed = await readResponseSafely(usersRes);

          if (usersParsed.ok && Array.isArray(usersParsed.json)) {
            const usersJson = usersParsed.json;

            if (key === "activeUsers") {
              const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
              const filtered = usersJson.filter((u) => {
                const lastActive =
                  u.lastActiveAt ||
                  u.last_active ||
                  u.lastSeen ||
                  u.lastLogin ||
                  u.last_logged_in ||
                  u.last_activity;
                if (!lastActive) return false;
                const t = Date.parse(lastActive);
                return !Number.isNaN(t) && t >= dayAgo;
              });
              setDetailData(
                filtered.length ? filtered : usersJson.slice(0, 50)
              );
              return;
            }

            if (key === "newSignups") {
              const today = new Date().toISOString().slice(0, 10);
              const filtered = usersJson.filter((u) => {
                const created = (
                  u.createdAt ||
                  u.created_at ||
                  u.CreatedAt ||
                  u.created ||
                  ""
                )
                  .toString()
                  .slice(0, 10);
                return created === today;
              });
              setDetailData(
                filtered.length ? filtered : usersJson.slice(0, 50)
              );
              return;
            }

            setDetailData(usersJson.slice(0, 50));
            return;
          }

          setDetailError(
            "No detailed data available (server returned non-JSON or empty). Check network/auth."
          );
          return;
        }

        if (key === "totalRevenue" || key === "bounceRate" || key === "avgSession") {
          const endpoint =
            key === "totalRevenue"
              ? endpoints.totalRevenue
              : key === "bounceRate"
              ? endpoints.bounceRate
              : endpoints.avgSession;
          const res = await fetch(endpoint, { headers });

          if (handleAuthFailure(res)) {
            setDetailError("Authentication required. Redirecting to login...");
            return;
          }

          const parsed = await readResponseSafely(res);

          if (!parsed.ok) {
            console.error(
              "Metric endpoint non-JSON/invalid:",
              parsed.raw?.slice?.(0, 300)
            );
            setDetailError(
              "Server returned non-JSON or error for metric endpoint. See console/network for details."
            );
          } else {
            const json = parsed.json;
            if (Array.isArray(json)) setDetailData(json);
            else if (typeof json === "object") setDetailData([json]);
            else setDetailData([{ value: json }]);
          }
          return;
        }

        setDetailError("No endpoint configured for this card.");
      } catch (err) {
        console.error("Detail fetch error:", err);
        setDetailError(
          "Failed to load details. Check console/network for full response."
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [navigate]
  );

  const dateKey =
    detailData.length > 0 &&
    Object.keys(detailData[0]).find((key) =>
      key.toLowerCase().includes("date") ||
      key.toLowerCase().includes("at") ||
      key.toLowerCase().includes("month")
    );

  const filteredDetailData = useMemo(() => {
    if (!selectedCard) return [];
    let filtered = detailData || [];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(lowerSearch)
        )
      );
    }
    if (dateKey) {
      if (filterDateFrom)
        filtered = filtered.filter(
          (item) => (item[dateKey] || "") >= filterDateFrom
        );
      if (filterDateTo)
        filtered = filtered.filter(
          (item) => (item[dateKey] || "") <= filterDateTo
        );
    }
    return filtered;
  }, [detailData, searchTerm, filterDateFrom, filterDateTo, selectedCard, dateKey]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setSelectedCard(null);
    }
    if (selectedCard) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [selectedCard]);

  const detailKeys =
    filteredDetailData.length > 0 &&
    typeof filteredDetailData[0] === "object"
      ? Object.keys(filteredDetailData[0])
      : [];

  return (
    <div className="admin-dashboard-container">
      <h2 className="admin-dashboard-title">Admin Dashboard Overview</h2>

      {cardsError && <div className="admin-dashboard-error">{cardsError}</div>}

      <div className="admin-dashboard-cards">
        {cards.map((item, i) => (
          <div
            key={item.label}
            className="admin-dashboard-card"
            style={{ background: colors[i % colors.length] }}
            onClick={() => handleCardClick(item.label, item.key)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                handleCardClick(item.label, item.key);
            }}
          >
            <div className="admin-dashboard-card-label">{item.label}</div>
            <div className="admin-dashboard-card-value">
              {cardsLoading ? "..." : item.value}
            </div>
            <div className="admin-dashboard-card-note">{item.note}</div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div
          className="admin-dashboard-modal-overlay"
          onClick={() => setSelectedCard(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="admin-dashboard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="admin-dashboard-modal-close"
              aria-label="Close modal"
              onClick={() => setSelectedCard(null)}
            >
              &times;
            </button>
            <h3 id="modal-title">Details for: {selectedCard}</h3>

            {detailLoading && <p>Loading details...</p>}
            {detailError && (
              <p className="admin-dashboard-error">{detailError}</p>
            )}

            {detailKeys.length > 0 && (
              <div
                className="admin-dashboard-filters"
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                }}
              >
                <div
                  className="input-with-icon"
                  style={{
                    flex: "1 1 200px",
                    minWidth: "200px",
                    position: "relative",
                  }}
                >
                  <FaSearch
                    className="input-icon"
                    style={{
                      position: "absolute",
                      left: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#555",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search details"
                    style={{
                      paddingLeft: "30px",
                      height: "36px",
                      width: "100%",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div className="date-filter-group">
                  <label htmlFor="filterDateFrom" className="date-label">
                    From
                  </label>
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      id="filterDateFrom"
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      aria-label="Filter from date"
                    />
                  </div>
                </div>

                <div className="date-filter-group">
                  <label htmlFor="filterDateTo" className="date-label">
                    To
                  </label>
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      id="filterDateTo"
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      aria-label="Filter to date"
                    />
                  </div>
                </div>
              </div>
            )}

            {!detailLoading && filteredDetailData.length === 0 ? (
              <p className="admin-dashboard-empty">No data found.</p>
            ) : (
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    {detailKeys.map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDetailData.map((row, idx) => (
                    <tr key={idx}>
                      {detailKeys.map((key) => (
                        <td key={key}>
                          {String(
                            row[key] ??
                              row[key.toLowerCase()] ??
                              ""
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
