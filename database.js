// server/db/database.js
// Sets up (or opens) the SQLite database and ensures required tables exist.

const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "bank.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// --- Schema ---------------------------------------------------------------

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    type          TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
    counterparty  TEXT NOT NULL,
    amount_cents  INTEGER NOT NULL,
    description   TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
