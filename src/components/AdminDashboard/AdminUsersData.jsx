import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE =
  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
const ALL_ACTIVITY_API = `${API_BASE}/activity-history`;
const USER_ACTIVITY_API = `${API_BASE}/activity-history`;

function AdminUsersData() {
  const { refreshKey } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalData, setModalData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const extractItems = (data) => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    return firstArray || [];
  };

  // --------- LOAD USERS FROM ACTIVITY HISTORY ----------
  useEffect(() => {
    const loadUsersFromHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${ALL_ACTIVITY_API}?pageSize=1000`, {
          headers,
        });

        const text = await res.text();
        console.log("All activity (for users) raw:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Activity-history API did not return valid JSON.");
        }

        if (!res.ok) {
          throw new Error(data.message || `Error ${res.status}`);
        }

        const items = extractItems(data);

        if (!items.length) {
          throw new Error("No activity found to derive users.");
        }

        // Build unique users by userId (or email) and take earliest timestamp as createdAt
        const usersMap = new Map();

        items.forEach((item, index) => {
          const userId = item.userId || item.userID || item.userIDFk;
          const email = item.email;
          const rawTs = item.timestamp || item.date || item.createdOn;

          if (!email || !rawTs) return;

          const key = userId ?? email;
          const name =
            item.userName ||
            item.name ||
            (email ? email.split("@")[0] : "Unknown");

          const tsDate = new Date(rawTs);
          const createdAt = isNaN(tsDate.getTime()) ? new Date() : tsDate;

          const existing = usersMap.get(key);
          if (!existing) {
            usersMap.set(key, {
              id: key || index,
              userId,
              name,
              email,
              createdAt,
            });
          } else {
            // keep earliest createdAt
            if (createdAt < existing.createdAt) {
              usersMap.set(key, { ...existing, createdAt });
            }
          }
        });

        const usersArray = Array.from(usersMap.values()).sort(
          (a, b) => a.createdAt - b.createdAt
        );

        setUsers(usersArray);
      } catch (err) {
        console.error("Users from activity-history error:", err);
        setError(err.message || "Failed to load users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsersFromHistory();
  }, [refreshKey, token]);

  // --------- CLICK USER → LOAD THAT USER'S ACTIVITY ----------
  const handleRowClick = async (user) => {
    const { userId, name, email } = user;

    if (!userId) {
      alert("User id not available for this record.");
      return;
    }

    try {
      setActivityLoading(true);

      const res = await fetch(
        `${USER_ACTIVITY_API}/${userId}?pageSize=100`,
        { headers }
      );

      const text = await res.text();
      console.log("User activity raw:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert("Activity API did not return valid JSON.");
        return;
      }

      if (!res.ok) {
        alert(data.message || `Error ${res.status}`);
        return;
      }

      const items = extractItems(data);

      const actions = items
        .map((a) => ({
          action: a.action || a.activity || a.description,
          date: a.timestamp || a.date || a.createdOn,
        }))
        .filter((a) => a.action && a.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (!actions.length) {
        alert("No activity found for this user.");
        return;
      }

      setModalData({
        name,
        email,
        actions,
      });
    } catch (err) {
      console.error("User activity error:", err);
      alert("Failed to load activity history for this user.");
    } finally {
      setActivityLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleStartDate = (e) => setStartDate(e.target.value);
  const handleEndDate = (e) => setEndDate(e.target.value);

  const filteredUsers = users.filter((u) => {
    const nameMatch = u.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = u.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    let dateMatch = true;
    const created = u.createdAt ? new Date(u.createdAt) : null;

    if (created && startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateMatch = created >= start;
    }

    if (created && endDate && dateMatch) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = created <= end;
    }

    return (nameMatch || emailMatch) && dateMatch;
  });

  if (loading) {
    return (
      <p className="admin-users__status-text admin-users__status-text--loading">
        Loading users...
      </p>
    );
  }

  if (!users.length) {
    return (
      <p className="admin-users__status-text admin-users__status-text--empty">
        No users found.
        {error ? ` (${error})` : ""}
      </p>
    );
  }

  return (
    <div className="admin-users__wrapper">
      <h2 className="admin-users__title">All Users</h2>

      <div className="admin-users__filters">
        <div className="admin-users__search">
          <span className="admin-users__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearch}
            className="admin-users__search-input"
          />
        </div>

        <div className="admin-users__date-group">
          <label htmlFor="startDate">From</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDate}
          />
        </div>

        <div className="admin-users__date-group">
          <label htmlFor="endDate">To</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDate}
          />
        </div>
      </div>

      <table className="admin-users__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>First Activity (Created At)</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="3" className="admin-users__no-results">
                No matching users
              </td>
            </tr>
          ) : (
            filteredUsers.map((u, idx) => (
              <tr
                key={u.id ?? idx}
                className={idx % 2 === 0 ? "even-row" : "odd-row"}
                onClick={() => handleRowClick(u)}
                style={{ cursor: "pointer" }}
              >
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Activity history modal */}
      {modalData && (
        <div
          className="admin-history__modal"
          onClick={() => setModalData(null)}
        >
          <div
            className="admin-history__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {modalData.name} ({modalData.email})
            </h3>
            <hr />
            {activityLoading ? (
              <p>Loading activity...</p>
            ) : (
              modalData.actions.map((act, idx) => (
                <div
                  key={idx}
                  className={`admin-history__modal-action ${
                    idx % 2 === 0
                      ? "admin-history__modal-action--even"
                      : "admin-history__modal-action--odd"
                  }`}
                >
                  <p>
                    <strong>Action:</strong> {act.action}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(act.date).toLocaleString()}
                  </p>
                </div>
              ))
            )}
            <button
              className="admin-history__modal-close-btn"
              onClick={() => setModalData(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersData;
