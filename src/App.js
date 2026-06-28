import React, { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  docco,
  atomOneDark,
  githubGist,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import "./index.css";

import AdminPanel from "./AdminPanel";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function PasteViewSplit() {
  // PastePage state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiresIn, setExpiresIn] = useState(24 * 60 * 60 * 1000); // 24 hours default
  const [sharedCode, setSharedCode] = useState(null);
  const [pasteError, setPasteError] = useState(null);

  // ViewPaste state
  const [viewName, setViewName] = useState("");
  const [viewSnippets, setViewSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [viewError, setViewError] = useState(null);

  // Available languages for syntax highlighting
  const languages = [
    { value: "plaintext", label: "Plain Text" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "sql", label: "SQL" },
    { value: "xml", label: "XML" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
  ];

  // Expiration time options
  const expirationOptions = [
    { value: 60 * 60 * 1000, label: "1 Hour" },
    { value: 24 * 60 * 60 * 1000, label: "24 Hours" },
    { value: 7 * 24 * 60 * 60 * 1000, label: "7 Days" },
    { value: 30 * 24 * 60 * 60 * 1000, label: "30 Days" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setPasteError(null);

    try {
      const res = await fetch(`${API_URL}/api/paste`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, language, expiresIn }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const statusHint = res.status === 404 ? " (backend route not found)" : "";
        throw new Error(
          errorData.error || `Unable to save paste. Try again.${statusHint}`
        );
      }

      await res.json();
      setSharedCode(true);
      setName("");
      setCode("");
    } catch (error) {
      console.error("Paste submit failed:", error);
      setPasteError(error.message || "Failed to submit paste.");
    }
  }

  async function handleView() {
    setViewError(null);
    setViewSnippets([]);
    setSelectedSnippet(null);

    if (!viewName) {
      setViewError("Please enter a name.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: viewName }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "No shared code found for this name.");
      }
      const data = await res.json();
      setViewSnippets(data.snippets);
      if (data.snippets.length > 0) {
        setSelectedSnippet(data.snippets[0]);
      }
    } catch (error) {
      console.error("View fetch failed:", error);
      setViewError(error.message || "Failed to load shared code.");
    }
  }

  function formatExpiryTime(timestamp) {
    const now = Date.now();
    const diff = timestamp - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours} hours`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days`;
    }
  }

  const [showCopied, setShowCopied] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div
      className="main-split"
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        background: "linear-gradient(120deg, #f6f9fc 0%, #e9ecef 100%)",
        fontFamily: "Poppins, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Paste Side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          borderRight: "1.5px solid rgba(226, 232, 240, 0.6)",
          minWidth: 0,
          padding: "20px",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            padding: "clamp(20px, 5vw, 44px)",
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#1a202c",
              marginBottom: "clamp(20px, 4vw, 32px)",
              fontWeight: 700,
              fontSize: "clamp(20px, 4vw, 30px)",
              letterSpacing: "-0.5px",
            }}
          >
            Share Your Code
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <label
              style={{
                fontWeight: 600,
                color: "#2d3748",
                fontSize: 15,
                display: "block",
                marginBottom: 6,
              }}
            >
              Your Name
            </label>
            <input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                marginBottom: 24,
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "Poppins, Arial, sans-serif",
                transition: "all 0.2s ease",
                backgroundColor: "#fff",
              }}
            />

            <div
              className="language-selector"
              style={{ display: "flex", gap: "12px", marginBottom: 24 }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#2d3748",
                    fontSize: 15,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Poppins, Arial, sans-serif",
                    transition: "all 0.2s ease",
                    backgroundColor: "#fff",
                  }}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#2d3748",
                    fontSize: 15,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Expires In
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Poppins, Arial, sans-serif",
                    transition: "all 0.2s ease",
                    backgroundColor: "#fff",
                  }}
                >
                  {expirationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label
              style={{
                fontWeight: 600,
                color: "#2d3748",
                fontSize: 15,
                display: "block",
                marginBottom: 6,
              }}
            >
              Code
            </label>
            <textarea
              className="code-input"
              placeholder="Paste your code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: "clamp(14px, 2vw, 15px)",
                fontFamily: "Fira Mono, monospace",
                marginBottom: 28,
                background: "#f8fafc",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                flex: 1,
                minHeight: "clamp(200px, 40vh, 300px)",
                transition: "all 0.2s ease",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #4c51bf 0%, #4299e1 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: "0.3px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(76,81,191,0.15)",
                transition: "all 0.3s ease",
                fontFamily: "Poppins, Arial, sans-serif",
              }}
            >
              Share Code
            </button>
          </form>
          {sharedCode && (
            <div
              style={{
                marginTop: 32,
                background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
                fontSize: 15,
                color: "#2d3748",
                wordBreak: "break-all",
                border: "1px solid #e2e8f0",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <span style={{ fontWeight: 600, color: "#1a202c" }}>
                Code shared successfully!
              </span>
              <br />
              <span
                style={{ color: "#4a5568", marginTop: 8, display: "block" }}
              >
                Tell your friend to enter your name to view the code.
              </span>
            </div>
          )}
        </div>
      </div>
      {/* View Side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          minWidth: 0,
          padding: "20px",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            padding: "clamp(20px, 5vw, 44px)",
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#1a202c",
              marginBottom: 32,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: "-0.5px",
            }}
          >
            View Shared Code
          </h2>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr auto",
                gap: "12px",
                alignItems: "start",
              }}
            >
              <input
                placeholder="Enter your friend's name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "Poppins, Arial, sans-serif",
                  transition: "all 0.2s ease",
                  backgroundColor: "#fff",
                }}
              />
              <button
                onClick={handleView}
                style={{
                  background:
                    "linear-gradient(135deg, #4c51bf 0%, #4299e1 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: "0.3px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(76,81,191,0.15)",
                  transition: "all 0.3s ease",
                  fontFamily: "Poppins, Arial, sans-serif",
                  height: "45px",
                  whiteSpace: "nowrap",
                }}
              >
                Show Code
              </button>
            </div>
          </div>

          {viewSnippets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontWeight: 600,
                  color: "#2d3748",
                  fontSize: 15,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Select Snippet
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {viewSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => setSelectedSnippet(snippet)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background:
                        selectedSnippet?.id === snippet.id ? "#4c51bf" : "#fff",
                      color:
                        selectedSnippet?.id === snippet.id ? "#fff" : "#2d3748",
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {snippet.language} ({formatExpiryTime(snippet.expiresAt)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedSnippet && (
            <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              <div style={{ position: "relative" }}>
                <div className="code-preview" style={{ position: "relative" }}>
                  <button
                    onClick={() => handleCopyCode(selectedSnippet.code)}
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
                      borderRadius: 12,
                      padding: "clamp(12px, 2vw, 16px)",
                      fontSize: "clamp(12px, 2vw, 15px)",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      overflowX: "auto",
                    }}
                    className="responsive-code"
                  >
                    {selectedSnippet.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          )}

          {viewError && (
            <div
              style={{
                color: "#e53e3e",
                marginTop: 18,
                textAlign: "center",
                fontWeight: 500,
                fontSize: 15,
                padding: "10px 16px",
                background: "#fff5f5",
                borderRadius: 8,
                border: "1px solid #fed7d7",
              }}
            >
              {viewError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewPaste({ id }) {
  // Left side state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [generatedId, setGeneratedId] = useState(null);
  // Right side state
  const [viewName, setViewName] = useState("");
  const [viewCode, setViewCode] = useState("");
  const [viewError, setViewError] = useState(null);
  const [viewId, setViewId] = useState(id || "");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/paste`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });
    const data = await res.json();
    setGeneratedId(data.id);
    setViewId(data.id);
    setViewName("");
    setViewCode("");
    setViewError(null);
  }

  async function handleView() {
    setViewError(null);
    setViewCode("");
    if (!viewId || !viewName) {
      setViewError("Please enter both link ID and name.");
      return;
    }
    const res = await fetch(`${API_URL}/api/view/${viewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: viewName }),
    });
    if (res.ok) {
      const data = await res.json();
      setViewCode(data.code);
    } else {
      setViewError("Wrong name or no such paste.");
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        background: "linear-gradient(120deg, #f6f9fc 0%, #e9ecef 100%)",
        fontFamily: "Poppins, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Paste Side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          borderRight: "1.5px solid rgba(226, 232, 240, 0.6)",
          minWidth: 0,
          padding: "20px",
          height: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            padding: "clamp(20px, 5vw, 44px)",
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#1a202c",
              marginBottom: "clamp(20px, 4vw, 32px)",
              fontWeight: 700,
              fontSize: "clamp(20px, 4vw, 30px)",
              letterSpacing: "-0.5px",
            }}
          >
            Share Your Code
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <label
              style={{
                fontWeight: 600,
                color: "#2d3748",
                fontSize: 15,
                display: "block",
                marginBottom: 6,
              }}
            >
              Your Name
            </label>
            <input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                marginBottom: 24,
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "Poppins, Arial, sans-serif",
                transition: "all 0.2s ease",
                backgroundColor: "#fff",
              }}
            />

            <div
              className="language-selector"
              style={{ display: "flex", gap: "12px", marginBottom: 24 }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#2d3748",
                    fontSize: 15,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Poppins, Arial, sans-serif",
                    transition: "all 0.2s ease",
                    backgroundColor: "#fff",
                  }}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#2d3748",
                    fontSize: 15,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Expires In
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Poppins, Arial, sans-serif",
                    transition: "all 0.2s ease",
                    backgroundColor: "#fff",
                  }}
                >
                  {expirationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label
              style={{
                fontWeight: 600,
                color: "#2d3748",
                fontSize: 15,
                display: "block",
                marginBottom: 6,
              }}
            >
              Code
            </label>
            <textarea
              className="code-input"
              placeholder="Paste your code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: "clamp(14px, 2vw, 15px)",
                fontFamily: "Fira Mono, monospace",
                marginBottom: 28,
                background: "#f8fafc",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                flex: 1,
                minHeight: "clamp(200px, 40vh, 300px)",
                transition: "all 0.2s ease",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #4c51bf 0%, #4299e1 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: "0.3px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(76,81,191,0.15)",
                transition: "all 0.3s ease",
                fontFamily: "Poppins, Arial, sans-serif",
              }}
            >
              Share Code
            </button>
          </form>
          {sharedCode && (
            <div
              style={{
                marginTop: 32,
                background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
                fontSize: 15,
                color: "#2d3748",
                wordBreak: "break-all",
                border: "1px solid #e2e8f0",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <span style={{ fontWeight: 600, color: "#1a202c" }}>
                Code shared successfully!
              </span>
              <br />
              <span
                style={{ color: "#4a5568", marginTop: 8, display: "block" }}
              >
                Tell your friend to enter your name to view the code.
              </span>
            </div>
          )}
        </div>
      </div>
      {/* View Side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          minWidth: 0,
          padding: "20px",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            padding: "clamp(20px, 5vw, 44px)",
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#1a202c",
              marginBottom: 32,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: "-0.5px",
            }}
          >
            View Shared Code
          </h2>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr auto",
                gap: "12px",
                alignItems: "start",
              }}
            >
              <input
                placeholder="Enter your friend's name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "Poppins, Arial, sans-serif",
                  transition: "all 0.2s ease",
                  backgroundColor: "#fff",
                }}
              />
              <button
                onClick={handleView}
                style={{
                  background:
                    "linear-gradient(135deg, #4c51bf 0%, #4299e1 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: "0.3px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(76,81,191,0.15)",
                  transition: "all 0.3s ease",
                  fontFamily: "Poppins, Arial, sans-serif",
                  height: "45px",
                  whiteSpace: "nowrap",
                }}
              >
                Show Code
              </button>
            </div>
          </div>

          {viewSnippets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontWeight: 600,
                  color: "#2d3748",
                  fontSize: 15,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Select Snippet
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {viewSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => setSelectedSnippet(snippet)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background:
                        selectedSnippet?.id === snippet.id ? "#4c51bf" : "#fff",
                      color:
                        selectedSnippet?.id === snippet.id ? "#fff" : "#2d3748",
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {snippet.language} ({formatExpiryTime(snippet.expiresAt)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedSnippet && (
            <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              <div style={{ position: "relative" }}>
                <div className="code-preview" style={{ position: "relative" }}>
                  <button
                    onClick={() => handleCopyCode(selectedSnippet.code)}
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
                      borderRadius: 12,
                      padding: "clamp(12px, 2vw, 16px)",
                      fontSize: "clamp(12px, 2vw, 15px)",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      overflowX: "auto",
                    }}
                    className="responsive-code"
                  >
                    {selectedSnippet.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          )}

          {viewError && (
            <div
              style={{
                color: "#e53e3e",
                marginTop: 18,
                textAlign: "center",
                fontWeight: 500,
                fontSize: 15,
                padding: "10px 16px",
                background: "#fff5f5",
                borderRadius: 8,
                border: "1px solid #fed7d7",
              }}
            >
              {viewError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if URL has admin parameter
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin") {
      setIsAdmin(true);
    }
  }, []);

  if (isAdmin) {
    return <AdminPanel />;
  }

  return <PasteViewSplit />;
}

export default App;
