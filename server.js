// server/server.js
const path = require("path");
const express = require("express");
const session = require("express-session");

require("./db/database"); // ensures tables exist on startup

const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/account");
const transferRoutes = require("./routes/transfer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutes
      sameSite: "lax",
    },
  })
);

// Serve the frontend
app.use(express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/transfer", transferRoutes);

app.listen(PORT, () => {
  console.log(`Online banking demo running at http://localhost:${PORT}`);
});
