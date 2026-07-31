// server/db/seed.js
// Populates the database with one demo user (Mary Smith) plus some sample
// transaction history. Safe to re-run: it clears existing data first.
//
// Run with: npm run seed

const bcrypt = require("bcryptjs");
const db = require("./database");

const USERNAME = "mary.smith";
const PLAIN_PASSWORD = "Password123!"; // demo login password - change in production
const FULL_NAME = "Mary Smith";
const ACCOUNT_NUMBER = "1000234567";
const STARTING_BALANCE_CENTS = 500000 * 100; // $500,000.00

function seed() {
  const resetAll = db.transaction(() => {
    db.exec("DELETE FROM transactions;");
    db.exec("DELETE FROM users;");
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','transactions');");

    const passwordHash = bcrypt.hashSync(PLAIN_PASSWORD, 10);

    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, account_number, balance_cents)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = insertUser.run(USERNAME, passwordHash, FULL_NAME, ACCOUNT_NUMBER, STARTING_BALANCE_CENTS);
    const userId = info.lastInsertRowid;

    const insertTxn = db.prepare(`
      INSERT INTO transactions (user_id, type, counterparty, amount_cents, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const sampleTransactions = [
      ["credit", "Payroll Deposit - Acme Corp", 850000, "Direct deposit", "-6 days"],
      ["debit", "Whole Foods Market", 12450, "Groceries", "-5 days"],
      ["debit", "Electric Company", 8900, "Utility bill", "-4 days"],
      ["debit", "Amazon.com", 5623, "Online purchase", "-3 days"],
      ["credit", "Transfer from Savings", 200000, "Internal transfer", "-2 days"],
      ["debit", "Chase Mortgage", 210000, "Monthly mortgage payment", "-1 days"],
      ["debit", "Netflix", 1599, "Subscription", "-12 hours"],
    ];

    const getOffsetTime = db.prepare(`SELECT datetime('now', ?) AS ts`);

    for (const [type, counterparty, amount, description, offset] of sampleTransactions) {
      const { ts } = getOffsetTime.get(offset);
      insertTxn.run(userId, type, counterparty, amount, description, ts);
    }
  });

  resetAll();
  console.log("Database seeded successfully.");
  console.log(`Login with username: ${USERNAME} / password: ${PLAIN_PASSWORD}`);
}

seed();
