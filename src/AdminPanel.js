import React, { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/cjs/styles/hljs";

const API_URL = process.env.REACT_APP_API_URL;

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [tempKey, setTempKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const fetchData = async () => {
    if (!adminKey) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey }),
      });

      if (!res.ok) {
        throw new Error("Unauthorized access");
      }

      const newData = await res.json();
      setData(newData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      fetchData();
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [adminKey, refreshInterval]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${API_URL}/api/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: tempKey }),
      });

      if (!res.ok) {
        throw new Error("Invalid admin key");
      }

      // Save admin key to localStorage for persistent session
      localStorage.setItem("adminKey", tempKey);
      setAdminKey(tempKey);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminKey");
    setAdminKey("");
    window.location.href = "/";
  };

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  function formatTimeLeft(expiresAt) {
    const now = Date.now();
    const diff = expiresAt - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours} hours`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days`;
    }
  }

  useEffect(() => {
    // Check for saved admin session
    const savedAdminKey = localStorage.getItem("adminKey");
    if (savedAdminKey) {
      setAdminKey(savedAdminKey);
    }
  }, []);

  if (!adminKey) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(120deg, #f6f9fc 0%, #e9ecef 100%)",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "clamp(20px, 5vw, 44px)",
            borderRadius: "clamp(10px, 2vw, 20px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4c51bf"
              strokeWidth="2"
              style={{ margin: "0 auto 1rem" }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h2
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Admin Access
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              Enter the password to access admin dashboard
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
              <div
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem 0.875rem 3rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#818cf8")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
            {loginError && (
              <div
                style={{
                  color: "#dc2626",
                  marginBottom: "1.5rem",
                  padding: "0.75rem",
                  background: "#fef2f2",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "1rem",
                background: "linear-gradient(135deg, #4c51bf 0%, #4299e1 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "transform 0.2s",
              }}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Login to Dashboard
            </button>
          </form>
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "0.875rem",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            Default password:{" "}
            <code
              style={{
                background: "#f3f4f6",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                color: "#4c51bf",
                fontFamily: "monospace",
              }}
            >
              admin123
            </code>
          </p>
        </div>
      </div>
    );
  }

  const renderCodePreview = () => {
    if (!selectedSnippet) return null;

    return (
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            background: "#f8fafc",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <h3>Snippet Details</h3>
          <p>Language: {selectedSnippet.language}</p>
          <p>Size: {(selectedSnippet.size / 1024).toFixed(1)}KB</p>
          <p>Created: {formatDate(selectedSnippet.createdAt)}</p>
          <p>Expires: {formatDate(selectedSnippet.expiresAt)}</p>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => handleCopyCode(selectedSnippet.codePreview)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              padding: "6px 12px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "13px",
              cursor: "pointer",
              zIndex: 1,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {showCopied ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Code
              </>
            )}
          </button>
          <SyntaxHighlighter
            language={selectedSnippet.language}
            style={githubGist}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            {selectedSnippet.codePreview}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  };

  return (
    <div
      className="admin-panel"
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "0",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          width: "240px",
          background: "#1e1e2d",
          color: "white",
          padding: "1.5rem 0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          transform: "translateX(0)",
          transition: "transform 0.3s ease",
          zIndex: 20,
          "@media (max-width: 768px)": {
            transform: "translateX(-100%)",
          },
        }}
      >
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#fff",
              letterSpacing: "0.5px",
              marginBottom: "0.5rem",
            }}
          >
            Code Sharing
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              letterSpacing: "0.5px",
            }}
          >
            Admin Dashboard
          </p>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              padding: "0.75rem 1.5rem",
              background: "rgba(255,255,255,0.1)",
              borderLeft: "4px solid #3b82f6",
              cursor: "pointer",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </div>
          </div>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "background 0.2s",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: "240px",
          "@media (max-width: 768px)": {
            marginLeft: 0,
          },
        }}
      >
        {/* Header */}
        <div
          className="sticky-header"
          style={{
            padding: "clamp(15px, 3vw, 25px) clamp(15px, 5vw, 32px)",
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            {lastRefresh && (
              <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                background: "white",
                color: "#1f2937",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <option value={5000}>Refresh: 5s</option>
              <option value={15000}>Refresh: 15s</option>
              <option value={30000}>Refresh: 30s</option>
              <option value={60000}>Refresh: 1m</option>
            </select>
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                background: loading ? "#f3f4f6" : "white",
                color: "#1f2937",
                cursor: loading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
                fontSize: "0.875rem",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: "clamp(15px, 5vw, 32px)" }}>
          {error && (
            <div
              style={{
                padding: "1rem",
                margin: "0 0 2rem 0",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Stats Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "clamp(15px, 3vw, 24px)",
                  marginBottom: "clamp(20px, 5vw, 32px)",
                }}
              >
                <div
                  style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "0.75rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "#e0e7ff",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div>
                      <h3
                        style={{
                          color: "#4b5563",
                          fontSize: "0.875rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Total Users
                      </h3>
                      <p
                        style={{
                          color: "#111827",
                          fontSize: "1.5rem",
                          fontWeight: "600",
                        }}
                      >
                        {data.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "0.75rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "#dcfce7",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3
                        style={{
                          color: "#4b5563",
                          fontSize: "0.875rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Total Snippets
                      </h3>
                      <p
                        style={{
                          color: "#111827",
                          fontSize: "1.5rem",
                          fontWeight: "600",
                        }}
                      >
                        {data.totalSnippets}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div
                className="content-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(250px, 300px) 1fr",
                  gap: "clamp(15px, 3vw, 24px)",
                  background: "white",
                  borderRadius: "0.75rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  "@media (max-width: 768px)": {
                    gridTemplateColumns: "1fr",
                  },
                }}
              >
                {/* Users List */}
                <div
                  style={{
                    borderRight: "1px solid #e5e7eb",
                    maxHeight: "calc(100vh - 270px)",
                    overflow: "auto",
                  }}
                >
                  <div
                    style={{
                      padding: "1.5rem",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      Users
                    </h2>
                  </div>
                  <div>
                    {data.users.map((user) => (
                      <div
                        key={user.username}
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedSnippet(null);
                        }}
                        style={{
                          padding: "1rem 1.5rem",
                          cursor: "pointer",
                          borderLeft:
                            selectedUser?.username === user.username
                              ? "4px solid #3b82f6"
                              : "4px solid transparent",
                          background:
                            selectedUser?.username === user.username
                              ? "#f8fafc"
                              : "transparent",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "full",
                              background: "#e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#4b5563",
                              fontSize: "1.125rem",
                              fontWeight: "600",
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3
                              style={{
                                color: "#111827",
                                fontSize: "0.9375rem",
                                fontWeight: "500",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {user.username}
                            </h3>
                            <p
                              style={{
                                fontSize: "0.8125rem",
                                color: "#6b7280",
                              }}
                            >
                              {user.snippetCount} snippet
                              {user.snippetCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Snippets Area */}
                {selectedUser ? (
                  <div style={{ padding: "1.5rem" }}>
                    <h2
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {selectedUser.username}'s Snippets
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {selectedUser.snippets.map((snippet) => (
                        <div
                          key={snippet.id}
                          onClick={() => setSelectedSnippet(snippet)}
                          style={{
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            border: "1px solid #e5e7eb",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            background:
                              selectedSnippet?.id === snippet.id
                                ? "#f8fafc"
                                : "white",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.75rem",
                            }}
                          >
                            <div
                              style={{
                                background: "#f3f4f6",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "1rem",
                                fontSize: "0.8125rem",
                                color: "#4b5563",
                                fontWeight: "500",
                              }}
                            >
                              {snippet.language}
                            </div>
                            <span
                              style={{
                                fontSize: "0.8125rem",
                                color: "#6b7280",
                              }}
                            >
                              {(snippet.size / 1024).toFixed(1)}KB
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: "0.8125rem",
                              color: "#6b7280",
                              display: "flex",
                              gap: "1rem",
                              marginBottom: "0.75rem",
                            }}
                          >
                            <div>Created: {formatDate(snippet.createdAt)}</div>
                            <div>
                              Expires in: {formatTimeLeft(snippet.expiresAt)}
                            </div>
                          </div>

                          <div
                            style={{
                              background: "#f8fafc",
                              padding: "0.75rem",
                              borderRadius: "0.375rem",
                              fontSize: "0.875rem",
                              fontFamily: "monospace",
                              color: "#334155",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {snippet.codePreview}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#6b7280",
                      fontSize: "0.9375rem",
                    }}
                  >
                    Select a user to view their snippets
                  </div>
                )}
              </div>
            </>
          )}

          {/* Selected Snippet Preview */}
          {selectedSnippet && (
            <div
              className="code-preview-modal"
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "clamp(300px, 50%, 800px)",
                height: "100vh",
                background: "white",
                boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
                padding: "clamp(15px, 5vw, 32px)",
                overflowY: "auto",
                zIndex: 50,
                "@media (max-width: 768px)": {
                  width: "100%",
                },
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Code Preview
                </h2>
                <button
                  onClick={() => setSelectedSnippet(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem",
                    color: "#6b7280",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Language
                    </p>
                    <p style={{ color: "#111827", fontWeight: "500" }}>
                      {selectedSnippet.language}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Size
                    </p>
                    <p style={{ color: "#111827", fontWeight: "500" }}>
                      {(selectedSnippet.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Created
                    </p>
                    <p style={{ color: "#111827", fontWeight: "500" }}>
                      {formatDate(selectedSnippet.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Expires
                    </p>
                    <p style={{ color: "#111827", fontWeight: "500" }}>
                      {formatDate(selectedSnippet.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => handleCopyCode(selectedSnippet.codePreview)}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    padding: "0.5rem 1rem",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#4b5563",
                    cursor: "pointer",
                    zIndex: 1,
                    transition: "all 0.2s",
                  }}
                >
                  {showCopied ? (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy Code
                    </>
                  )}
                </button>
                <SyntaxHighlighter
                  language={selectedSnippet.language}
                  style={githubGist}
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.75rem",
                    padding: "1.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {selectedSnippet.codePreview}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
