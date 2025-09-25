const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/cookieApp")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Cookie Schema
const cookieSchema = new mongoose.Schema({
  cookie_token: String,
  userId: String,
  userRole: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 5 } // expire in 5 mins
});
const Cookie = mongoose.model("Cookie", cookieSchema);

// Dummy User (for demo)
const USERS = [{ id: "1", username: "admin", password: "12345", rolename:"adsys"}];

// --- Routes ---
// Login → set cookie
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).send("Invalid credentials");

  // create cookie cookie_token
  const cookie_token = crypto.randomUUID();

  // save cookie in DB
  await Cookie.create({ cookie_token, userId: user.id, userRole: user.rolename });

  // send cookie to browser
  res.cookie("auth_cookie_token", cookie_token, { httpOnly: true, maxAge: 1000 * 60 * 5 });
  res.send("Logged in!");
});

// Protected route
app.get("/profile", async (req, res) => {
  const cookie_token = req.cookies.auth_cookie_token;
  if (!cookie_token) return res.status(401).send("No cookie found");

  const session = await Cookie.findOne({ cookie_token });
  if (!session) return res.status(401).send("Invalid or expired cookie");

  res.send(`Welcome user ${session.userId}, your cookie is valid.`);
});

// Logout → delete cookie
app.post("/logout", async (req, res) => {
  const cookie_token = req.cookies.auth_cookie_token;
  if (cookie_token) {
    await Cookie.deleteOne({ cookie_token });
    res.clearCookie("auth_cookie_token");
  }
  res.send("Logged out.");
});

// Start server
app.listen(3001, () => console.log("Server running on http://localhost:3001"));