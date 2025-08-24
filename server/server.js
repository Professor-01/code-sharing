require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
};

// Store codes in memory with advanced structure
const codeStore = new Map();

// Configure express for large payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors(corsOptions));

// Utility function to clean expired codes
function cleanExpiredCodes() {
  for (const [username, userData] of codeStore.entries()) {
    userData.snippets = userData.snippets.filter((snippet) => {
      return Date.now() < snippet.expiresAt;
    });

    if (userData.snippets.length === 0) {
      codeStore.delete(username);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanExpiredCodes, 5 * 60 * 1000);

// Endpoint to store code by username
app.post("/api/paste", (req, res) => {
  const { name, code, language, expiresIn } = req.body;

  if (!name || !code) {
    return res.status(400).json({ error: "Name and code are required" });
  }

  // Get or create user data
  if (!codeStore.has(name)) {
    codeStore.set(name, { snippets: [] });
  }

  const userData = codeStore.get(name);

  // Create new snippet with expiration
  const snippet = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    code,
    language: language || "plaintext",
    createdAt: Date.now(),
    expiresAt: Date.now() + (expiresIn || 24 * 60 * 60 * 1000), // Default 24 hours
  };

  userData.snippets.push(snippet);

  // Keep only the last 10 snippets if there are more
  if (userData.snippets.length > 10) {
    userData.snippets = userData.snippets.slice(-10);
  }

  res.json({
    snippetId: snippet.id,
    expiresAt: snippet.expiresAt,
    language: snippet.language,
  });
});

// Endpoint to retrieve all snippets for a user
app.post("/api/view", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const userData = codeStore.get(name);

  if (!userData || userData.snippets.length === 0) {
    return res.status(404).json({ error: "No code found for this name" });
  }

  // Clean expired snippets before sending
  userData.snippets = userData.snippets.filter(
    (snippet) => Date.now() < snippet.expiresAt
  );

  if (userData.snippets.length === 0) {
    codeStore.delete(name);
    return res
      .status(404)
      .json({ error: "No active code found for this name" });
  }

  // Return all active snippets
  res.json({
    snippets: userData.snippets.map((snippet) => ({
      id: snippet.id,
      code: snippet.code,
      language: snippet.language,
      createdAt: snippet.createdAt,
      expiresAt: snippet.expiresAt,
    })),
  });
});

// Endpoint to retrieve a specific snippet
app.post("/api/view/:snippetId", (req, res) => {
  const { name } = req.body;
  const { snippetId } = req.params;

  if (!name || !snippetId) {
    return res.status(400).json({ error: "Name and snippet ID are required" });
  }

  const userData = codeStore.get(name);

  if (!userData) {
    return res.status(404).json({ error: "No code found for this name" });
  }

  const snippet = userData.snippets.find((s) => s.id === snippetId);

  if (!snippet || Date.now() > snippet.expiresAt) {
    return res.status(404).json({ error: "Snippet not found or expired" });
  }

  res.json({
    id: snippet.id,
    code: snippet.code,
    language: snippet.language,
    createdAt: snippet.createdAt,
    expiresAt: snippet.expiresAt,
  });
});

// Admin endpoint to get all data
app.post("/api/admin", (req, res) => {
  const { adminKey } = req.body;

  // Simple admin key check - in production, use proper authentication
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const allData = [];
  for (const [username, userData] of codeStore.entries()) {
    // Clean expired snippets for accurate data
    userData.snippets = userData.snippets.filter(
      (snippet) => Date.now() < snippet.expiresAt
    );

    if (userData.snippets.length > 0) {
      allData.push({
        username,
        snippetCount: userData.snippets.length,
        snippets: userData.snippets.map((snippet) => ({
          id: snippet.id,
          language: snippet.language,
          createdAt: snippet.createdAt,
          expiresAt: snippet.expiresAt,
          codePreview:
            snippet.code.substring(0, 100) +
            (snippet.code.length > 100 ? "..." : ""),
          size: snippet.code.length,
        })),
      });
    }
  }

  res.json({
    totalUsers: allData.length,
    totalSnippets: allData.reduce((acc, user) => acc + user.snippetCount, 0),
    users: allData,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
