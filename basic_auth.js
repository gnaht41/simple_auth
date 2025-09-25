// server.js
const express = require("express");
const app = express();

// Hardcoded username and password for demo
const USERNAME = "admin";
const PASSWORD = "12345";

// Middleware for basic authentication
function basicAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    return res.status(401).send("Authentication required.");
  }

  // Extract base64 encoded part
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  const [username, password] = credentials.split(":");

  // Check credentials
  if (username === USERNAME && password === PASSWORD) {
    return next();
  } else {
    return res.status(403).send("Access denied.");
  }
}

// Protected (secure) route
app.get("/secure", basicAuth, (req, res) => {
  res.send("You have accessed a protected resource 🎉");
});

// Public (non-secure) route
app.get("/", (req, res) => {
  res.send("Welcome! Visit first public resource.");
});

app.get("/public", (req, res) => {
  res.send("Welcome! Visit second public resource.");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});