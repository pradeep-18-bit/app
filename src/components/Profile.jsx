import React, { useEffect, useState, useRef } from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css";

const API = {
  getProfile: "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/profile",
  updateProfile: "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/profile",
  uploadPhoto: "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/upload-photo",
};

const LOCAL_KEY = "userProfileData";

export default function ProfileWithAPI() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    avatarUrl: null,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const previewUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  // -------------------- LOCAL STORAGE HELPERS --------------------
  const loadLocalProfile = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saveLocalProfile = (data) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch {}
  };

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  // -------------------- LOAD LOCAL + API DATA --------------------
  useEffect(() => {
    const local = loadLocalProfile();
    if (local) setProfile((prev) => ({ ...prev, ...local }));

    fetchProfile();

    return () => {
      if (previewUrlRef.current) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch {}
      }
    };
  }, []);

  const normalizeAvatarUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//.test(url)) return url;

    return `${API.uploadPhoto.split("/api")[0]}${url}`;
  };

  async function fetchProfile() {
    setLoading(true);
    try {
      const token = getToken();

      const res = await fetch(API.getProfile, {
        method: "GET",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok || !data) return;

      const updatedProfile = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        bio: data.bio || "",
        avatarUrl: normalizeAvatarUrl(data.avatarUrl),
      };

      setProfile(updatedProfile);
      saveLocalProfile(updatedProfile);
    } catch {
      console.warn("Failed to fetch API profile — using local");
    } finally {
      setLoading(false);
    }
  }

  // -------------------- HANDLE INPUT CHANGE --------------------
  function handleFieldChange(e) {
    const { name, value } = e.target;
    const updated = { ...profile, [name]: value };
    setProfile(updated);
    saveLocalProfile(updated);
  }

  // -------------------- SAVE PROFILE --------------------
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = getToken();

      const body = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email, // ✅ FIXED
        bio: profile.bio,
      };

      const res = await fetch(API.updateProfile, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();

      const merged = {
        ...profile,
        firstName: updated.firstName || profile.firstName,
        lastName: updated.lastName || profile.lastName,
        email: updated.email || profile.email,
        bio: updated.bio || profile.bio,
        avatarUrl: normalizeAvatarUrl(updated.avatarUrl || profile.avatarUrl),
      };

      setProfile(merged);
      saveLocalProfile(merged);

      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setError("Could not update profile");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }

  // -------------------- UPLOAD PHOTO --------------------
  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    previewUrlRef.current = tempUrl;

    setProfile((prev) => ({ ...prev, avatarUrl: tempUrl }));
    saveLocalProfile({ ...profile, avatarUrl: tempUrl });

    if (file.size > 2 * 1024 * 1024) {
      setError("Max size 2MB");
      return;
    }

    setSaving(true);

    try {
      const token = getToken();
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(API.uploadPhoto, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Upload failed");

      const newUrl = normalizeAvatarUrl(data.avatarUrl);

      const updated = { ...profile, avatarUrl: newUrl };
      setProfile(updated);
      saveLocalProfile(updated);
    } catch {
      setError("Could not upload photo");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  }

  const displayedAvatar = profile.avatarUrl || previewUrl || null;

  return (
    <SettingsLayout>
      <div className="profile_container">
        <h3 className="profile_heading">Profile Information</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Avatar Section */}
            <div className="profile_avatar_section">
              {displayedAvatar ? (
                <img src={displayedAvatar} alt="avatar" className="profile_avatar_img" />
              ) : (
                <div className="profile_avatar">JD</div>
              )}

              <div className="profile_avatar_actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoSelect}
                />

                <button
                  type="button"
                  className="profile_blue_button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave}>
              <div className="profile_form_row">
                <div className="profile_form_col">
                  <label className="profile_label">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={handleFieldChange}
                    className="profile_input"
                  />
                </div>

                <div className="profile_form_col">
                  <label className="profile_label">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={handleFieldChange}
                    className="profile_input"
                  />
                </div>
              </div>

              {/* FIXED EMAIL FIELD */}
              <div className="profile_form_group">
                <label className="profile_label">Email</label>
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleFieldChange}
                  className="profile_input"
                />
              </div>

              <div className="profile_form_group">
                <label className="profile_label">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleFieldChange}
                  className="profile_textarea"
                />
              </div>

              {error && <div style={{ color: "red" }}>{error}</div>}
              {successMsg && <div style={{ color: "green" }}>{successMsg}</div>}

              <button type="submit" className="profile_green_button">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </>
        )}
      </div>
    </SettingsLayout>
  );
}
