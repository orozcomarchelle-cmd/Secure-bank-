// server/routes/transfer.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// POST /api/transfer - move funds out of the logged-in user's account
router.post("/", requireAuth, (req, res) => {
  const { recipientName, recipientAccount, amount, memo } = req.body;

  // --- Validation ---
  if (!recipientName || !recipientName.trim()) {
    return res.status(400).json({ error: "Recipient name is required." });
  }
  if (!recipientAccount || !/^[0-9]{6,20}$/.test(recipientAccount.trim())) {
    return res.status(400).json({ error: "Recipient account number must be 6-20 digits." });
  }
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number." });
  }
  if (amountNum > 1000000) {
    return res.status(400).json({ error: "Amount exceeds the maximum allowed transfer." });
  }

  const amountCents = Math.round(amountNum * 100);

  const doTransfer = db.transaction(() => {
    const user = db.prepare("SELECT balance_cents FROM users WHERE id = ?").get(req.session.userId);

    if (amountCents > user.balance_cents) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    db.prepare("UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?").run(
      amountCents,
      req.session.userId
    );

    db.prepare(
      `INSERT INTO transactions (user_id, type, counterparty, amount_cents, description)
       VALUES (?, 'debit', ?, ?, ?)`
    ).run(
      req.session.userId,
      `${recipientName.trim()} (Acct ${recipientAccount.trim()})`,
      amountCents,
      memo && memo.trim() ? memo.trim() : "Funds transfer"
    );

    return db.prepare("SELECT balance_cents FROM users WHERE id = ?").get(req.session.userId);
  });

  try {
    const updated = doTransfer();
    return res.json({
      message: "Transfer completed successfully.",
      newBalance: Math.round(updated.balance_cents) / 100,
    });
  } catch (err) {
    if (err.message === "INSUFFICIENT_FUNDS") {
      return res.status(400).json({ error: "Insufficient funds for this transfer." });
    }
    console.error(err);
    return res.status(500).json({ error: "Transfer failed. Please try again." });
  }
});

module.exports = router;
