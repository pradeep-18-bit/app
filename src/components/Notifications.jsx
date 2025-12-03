import React, { useEffect, useState, useRef } from "react";
import SettingsLayout from "../SettingsLayout"; // ✅ Import stays here
import "../SettingsLayout.css";

export default function Notifications({
  apiUrl = "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Settings/notifications",
  authToken = null,
  useCredentials = false,
  onAuthRequired = null,
  successDurationMs = 5000,
}) {
  const [email, setEmail] = useState(true);
  const [contentComplete, setContentComplete] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [newTemplate, setNewTemplate] = useState(false);
  const [usageLimit, setUsageLimit] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusType, setStatusType] = useState(null);
  const [needAuth, setNeedAuth] = useState(false);
  const successTimeoutRef = useRef(null);

  const effectiveToken =
    authToken ||
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    null;

  const makePayload = () => ({
    emailNotifications: email,
    contentComplete: contentComplete,
    weeklySummary: weeklySummary,
    newTemplateAlerts: newTemplate,
    usageLimitWarnings: usageLimit,
    productUpdates: productUpdates,
  });

  const buildFetchOpts = (method = "GET", body = null) => {
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420",
    };
    if (effectiveToken) headers["Authorization"] = `Bearer ${effectiveToken}`;

    const opts = { method, headers };
    if (useCredentials) opts.credentials = "include";
    if (body) opts.body = JSON.stringify(body);
    return opts;
  };

  const readResponse = async (res) => {
    const text = await res.text().catch(() => "");
    try {
      return { status: res.status, ok: res.ok, body: JSON.parse(text) };
    } catch {
      return { status: res.status, ok: res.ok, body: text };
    }
  };

  const showStatus = (message, type = null) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setStatus(message);
    setStatusType(type);

    if (type === "success") {
      successTimeoutRef.current = setTimeout(() => {
        setStatus(null);
        setStatusType(null);
        successTimeoutRef.current = null;
      }, successDurationMs);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setStatus(null);
    setNeedAuth(false);

    const opts = buildFetchOpts("GET");
    opts.signal = controller.signal;

    (async () => {
      try {
        const res = await fetch(apiUrl, opts);
        const parsed = await readResponse(res);
        if (!parsed.ok) {
          if (parsed.status === 401) {
            setNeedAuth(true);
            showStatus("Unauthorized — please sign in", "error");
            if (typeof onAuthRequired === "function") onAuthRequired();
            throw new Error(`GET failed: 401 ${String(parsed.body)}`);
          }
          throw new Error(`GET failed: ${parsed.status} ${String(parsed.body)}`);
        }
        if (cancelled) return;

        const data = parsed.body || {};
        setEmail(Boolean(data.emailNotifications ?? data.email ?? email));
        setContentComplete(Boolean(data.contentComplete ?? data.content_complete ?? contentComplete));
        setWeeklySummary(Boolean(data.weeklySummary ?? data.weekly_summary ?? weeklySummary));
        setNewTemplate(Boolean(data.newTemplateAlerts ?? data.newTemplate ?? newTemplate));
        setUsageLimit(Boolean(data.usageLimitWarnings ?? data.usageLimit ?? usageLimit));
        setProductUpdates(Boolean(data.productUpdates ?? data.product_updates ?? productUpdates));

        showStatus("Loaded", null);
      } catch (err) {
        if (cancelled) return;
        showStatus(`Unable to load settings: ${err.message}`, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, [apiUrl, effectiveToken, useCredentials]);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    const payload = makePayload();
    const opts = buildFetchOpts("POST", payload);

    try {
      const res = await fetch(apiUrl, opts);
      const parsed = await readResponse(res);
      if (!parsed.ok) {
        if (parsed.status === 401) {
          setNeedAuth(true);
          showStatus("Unauthorized — please sign in to save settings", "error");
          if (typeof onAuthRequired === "function") onAuthRequired();
          throw new Error(`POST failed: 401 ${String(parsed.body)}`);
        }
        throw new Error(`POST failed: ${parsed.status} ${String(parsed.body)}`);
      }
      showStatus("Settings saved successfully", "success");
    } catch (err) {
      showStatus(`Unable to save settings: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    { label: "Email Notifications", checked: email, set: setEmail, helper: "Receive updates via email" },
    { label: "Content Generation Complete", checked: contentComplete, set: setContentComplete, helper: "Notify when content generation is finished" },
    { label: "Weekly Summary", checked: weeklySummary, set: setWeeklySummary, helper: "Get a weekly summary of your content activity" },
    { label: "New Template Alerts", checked: newTemplate, set: setNewTemplate, helper: "Get notified about new templates" },
    { label: "Usage Limit Warnings", checked: usageLimit, set: setUsageLimit, helper: "Alert when approaching usage limits" },
    { label: "Product Updates", checked: productUpdates, set: setProductUpdates, helper: "Stay informed about new features and updates" },
  ];

  return (
    <SettingsLayout> {/* ✅ Wrapped in your shared layout */}
      <div className="notif_container">
        <h3 className="notif_heading">Notification Settings</h3>
        <p className="notif_subheading">
          Choose what notifications you want to receive
        </p>

        {needAuth ? (
          <div className="notif_row" style={{ flexDirection: "column", gap: 8 }}>
            <p style={{ color: "#b00020" }}>
              You need to sign in to see or change notification settings.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="notif_button"
                onClick={() =>
                  typeof onAuthRequired === "function"
                    ? onAuthRequired()
                    : (window.location.href = "/login")
                }
              >
                Sign in
              </button>
              <button
                className="notif_button"
                onClick={() => {
                  setStatus(null);
                  setNeedAuth(false);
                  window.location.reload();
                }}
              >
                Retry
              </button>
            </div>
          </div>
        ) : loading ? (
          <p>Loading settings...</p>
        ) : (
          rows.map((row) => (
            <div key={row.label} className="notif_row">
              <div>
                <strong>{row.label}</strong>
                <p className="notif_helper">{row.helper}</p>
              </div>
              <input
                type="checkbox"
                checked={row.checked}
                onChange={() => row.set(!row.checked)}
                className="notif_toggle"
                disabled={saving}
              />
            </div>
          ))
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            marginTop: 12,
          }}
        >
          <button
            className="notif_button"
            onClick={handleSave}
            disabled={loading || saving || needAuth}
          >
            {saving ? "Saving..." : "Save Notification Settings"}
          </button>
          {status && (
            <span
              style={{
                marginTop: 8,
                color:
                  statusType === "success"
                    ? "#007a3d"
                    : statusType === "error"
                    ? "#b00020"
                    : undefined,
                transition: "opacity 200ms",
              }}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
}
