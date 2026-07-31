// server/routes/account.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

function centsToDollars(cents) {
  return Math.round(cents) / 100;
}

// GET /api/account/summary - balance + profile info
router.get("/summary", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT full_name, account_number, balance_cents FROM users WHERE id = ?")
    .get(req.session.userId);

  if (!user) return res.status(404).json({ error: "Account not found." });

  res.json({
    fullName: user.full_name,
    accountNumber: user.account_number,
    balance: centsToDollars(user.balance_cents),
  });
});

// GET /api/account/transactions - recent transaction history
router.get("/transactions", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, type, counterparty, amount_cents, description, created_at
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 25`
    )
    .all(req.session.userId);

  const transactions = rows.map((t) => ({
    id: t.id,
    type: t.type,
    counterparty: t.counterparty,
    amount: centsToDollars(t.amount_cents),
    description: t.description,
    date: t.created_at,
  }));

  res.json({ transactions });
});

module.exports = router;
