import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaEye, FaDownload, FaRedo } from "react-icons/fa";
import "./ContentHistory.css";

const ContentHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedItem, setSelectedItem] = useState(null);

  // Load saved content
  useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("contentHistory")) || [];

  // ⭐ Sort newest first
  const sorted = saved.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  setHistory(sorted);
}, []);


  // Delete content
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const updated = [...history];
      updated.splice(index, 1);
      setHistory(updated);
      localStorage.setItem("contentHistory", JSON.stringify(updated));
    }
  };

  // Download content as .txt
  const handleDownload = (item) => {
    const blob = new Blob([item.content || ""], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title || "content"}.txt`;
    link.click();
  };

  // View modal
  const handleView = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  // 🔁 Repost (send back to generator)
  const handleRepost = (item) => {
    // Save the item data temporarily
    localStorage.setItem("repostContent", JSON.stringify(item));
    // Redirect to generator page
    window.location.href = "/content-generator";
  };

  // Filters
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = typeFilter === "All Types" || item.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });
  // ✏️ Edit (open in content generator pre-filled)
const handleEdit = (item) => {
  // Save the current item to localStorage so generator can load it
  localStorage.setItem(
    "repostContent",
    JSON.stringify({
      ...item,
      tone: item.tone || "Professional",
      wordCount: item.wordCount || 500,
      status: "Draft",
    })
  );

  // Redirect to content generator page
  window.location.href = "/content-generator";
};


  return (
    <div className="history-container">
      <div className="history-page">
        {/* Header */}
        <div className="history-header">
          <div>
            <h2>Content History</h2>
            <p>Manage and track all your generated content</p>
          </div>
          <button
            className="generate-btn"
            onClick={() => (window.location.href = "/content-generator")}
          >
            Generate New Content
          </button>
        </div>

        {/* Filters */}
        <div className="history-filters">
          <input
            type="text"
            placeholder="🔍 Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All Types</option>
            <option>Blog Post</option>
            <option>Email Copy</option>
            <option>Ad Copy</option>
            <option>Social Media</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Draft</option>
            <option>Published</option>
            <option>Archived</option>
          </select>
        </div>

        {/* History List */}
        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <p className="empty">No content found.</p>
          ) : (
            filteredHistory.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-info">
                  <div className="history-top">
                    <h3>{item.title}</h3>
                  </div>

                  <div className="history-meta">
                    <span className="type">{item.type || "Blog Post"}</span>
                    <span className="status">{item.status || "Draft"}</span>
                    <span className="date">
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "No Date"}
                    </span>
                    <span className="words">{item.wordCount || 0} words</span>
                  </div>

                  <p className="history-preview">
                    {item.content
                      ? item.content.slice(0, 120) + "..."
                      : "No preview available."}
                  </p>
                </div>

                <div className="history-actions">
                  <FaEye
                    title="View"
                    className="icon"
                    onClick={() => handleView(item)}
                  />
                  <FaEdit
  title="Edit"
  className="icon"
  onClick={() => handleEdit(item)}
/>

                  <FaDownload
                    title="Download"
                    className="icon"
                    onClick={() => handleDownload(item)}
                  />
                  <FaRedo
                    title="Repost"
                    className="icon"
                    onClick={() => handleRepost(item)}
                  />
                  <FaTrash
                    title="Delete"
                    className="icon delete"
                    onClick={() => handleDelete(index)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Modal */}
        {selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedItem.title}</h3>
                <button className="close-btn" onClick={closeModal}>
                  ✖
                </button>
              </div>
              <div className="modal-meta">
                <span>🗓 {new Date(selectedItem.date).toLocaleDateString()}</span>
                <span>✍️ {selectedItem.type}</span>
                <span>📌 {selectedItem.status}</span>
                <span>📏 {selectedItem.wordCount} words</span>
              </div>
              <hr />
              <div className="modal-body">
                <p>{selectedItem.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentHistory;
