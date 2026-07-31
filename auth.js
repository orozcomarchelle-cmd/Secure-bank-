// server/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/database");
const requireAuth = require("../middleware/requireAuth");
const { validatePassword } = require("../utils/passwordValidation");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  // Generic error message on purpose - don't reveal whether the username exists.
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  req.session.userId = user.id;
  return res.json({
    message: "Login successful.",
    user: { fullName: user.full_name, username: user.username },
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out. Please try again." });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out." });
  });
});

// GET /api/auth/session - check if the current session is logged in
router.get("/session", (req, res) => {
  if (req.session && req.session.userId) {
    const user = db.prepare("SELECT full_name, username FROM users WHERE id = ?").get(req.session.userId);
    return res.json({ loggedIn: true, user: { fullName: user.full_name, username: user.username } });
  }
  return res.json({ loggedIn: false });
});

// POST /api/auth/change-password - update the logged-in user's password
router.post("/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.userId);
  if (!user || !bcrypt.compareSync(currentPassword || "", user.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  const { valid, errors } = validatePassword(newPassword);
  if (!valid) {
    return res.status(400).json({ error: "Password does not meet requirements.", details: errors });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, user.id);

  return res.json({ message: "Password updated successfully." });
});

module.exports = router;
