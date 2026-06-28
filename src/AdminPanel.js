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
      const res = await fetch("http://localhost:3001/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: tempKey }),
      });

      if (!res.ok) {
        throw new Error("Invalid admin key");
      }

      setAdminKey(tempKey);
    } catch (err) {
      setLoginError(err.message);
    }
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

  if (!adminKey) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(120deg, #f6f9fc 0%, #e9ecef 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            width: "90%",
            maxWidth: "400px",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            Admin Access
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin key"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #e2e8f0",
                marginBottom: "1rem",
              }}
            />
            {loginError && (
              <div
                style={{
                  color: "#e53e3e",
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  background: "#fff5f5",
                  borderRadius: "0.5rem",
                  textAlign: "center",
                  fontSize: "0.875rem",
                }}
              >
                {loginError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                background:
                  "linear-gradient(135deg, #4c51bf 0%, #4299e1 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Login
            </button>
          </form>
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
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f6f9fc 0%, #e9ecef 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #4c51bf 0%, #4299e1 100%)",
            color: "white",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              Admin Panel
            </h1>
            {lastRefresh && (
              <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
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
                borderRadius: "0.375rem",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                cursor: "pointer",
              }}
            >
              {loading ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>
        </div>

        {error ? (
          <div
            style={{
              padding: "1rem",
              margin: "1rem",
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              borderRadius: "0.5rem",
              color: "#e53e3e",
            }}
          >
            {error}
          </div>
        ) : (
          data && (
            <div style={{ display: "flex", height: "calc(100vh - 8rem)" }}>
              {/* Users List */}
              <div
                style={{
                  width: "300px",
                  borderRight: "1px solid #e2e8f0",
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
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      color: "#4a5568",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Statistics
                  </h3>
                  <p style={{ fontSize: "0.875rem" }}>
                    Total Users: {data.totalUsers}
                  </p>
                  <p style={{ fontSize: "0.875rem" }}>
                    Total Snippets: {data.totalSnippets}
                  </p>
                </div>
                {data.users.map((user) => (
                  <div
                    key={user.username}
                    onClick={() => {
                      setSelectedUser(user);
                      setSelectedSnippet(null);
                    }}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      marginBottom: "0.5rem",
                      cursor: "pointer",
                      background:
                        selectedUser?.username === user.username
                          ? "#edf2f7"
                          : "transparent",
                    }}
                  >
                    <h3 style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                      {user.username}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#4a5568" }}>
                      {user.snippetCount} snippet
                      {user.snippetCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>

              {/* Snippets List */}
              {selectedUser && (
                <div
                  style={{
                    width: "300px",
                    borderRight: "1px solid #e2e8f0",
                    overflow: "auto",
                    padding: "1rem",
                  }}
                >
                  <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
                    {selectedUser.username}'s Snippets
                  </h2>
                  {selectedUser.snippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      onClick={() => setSelectedSnippet(snippet)}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        marginBottom: "0.5rem",
                        cursor: "pointer",
                        background:
                          selectedSnippet?.id === snippet.id
                            ? "#edf2f7"
                            : "transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>
                          {snippet.language}
                        </span>
                        <span
                          style={{ fontSize: "0.875rem", color: "#4a5568" }}
                        >
                          {(snippet.size / 1024).toFixed(1)}KB
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#4a5568",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Created: {formatDate(snippet.createdAt)}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#4a5568" }}>
                        Expires in: {formatTimeLeft(snippet.expiresAt)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#4a5568",
                          marginTop: "0.5rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {snippet.codePreview}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Code Preview */}
              {selectedSnippet && renderCodePreview()}
            </div>
          )
        )}
      </div>
    </div>
  );
}
