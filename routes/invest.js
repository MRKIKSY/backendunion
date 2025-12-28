const express = require("express");
const Transaction = require("../models/Transaction");
const Investment = require("../models/Investment");
const { auth } = require("../middleware/auth");

const router = express.Router();

/* ======================================================
   HELPER: AVAILABLE BALANCE (CANNOT GO BELOW 0)
====================================================== */
async function getAvailableBalance(username) {
  const txs = await Transaction.find({
    user_id: username,
    status: "completed"
  });

  const credits = txs
    .filter(t => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);

  const debits = txs
    .filter(t => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);

  return Math.max(credits - debits, 0);
}

/* ======================================================
   INVEST (LOCK BY DEBIT ONLY — NO CREDIT CREATED)
====================================================== */
router.post("/", auth, async (req, res) => {
  try {
    const { amount, days, percent } = req.body;
    const username = req.user.username;

    if (!amount || amount <= 0 || !days || !percent) {
      return res.status(400).json({ error: "Invalid investment data" });
    }

    const available = await getAvailableBalance(username);

    if (amount > available) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    /* 🔻 DEBIT (THIS IS THE COST OF LOCKING FUNDS) */
    await Transaction.create({
      user_id: username,
      type: "debit",
      amount,
      status: "completed",
      description: `Investment lock for ${days} days`
    });

    const paidAt = new Date();
    const maturityDate = new Date(
      paidAt.getTime() + days * 24 * 60 * 60 * 1000
    );

    const expectedReturn =
      Number(amount) + (Number(amount) * Number(percent)) / 100;

    const investment = await Investment.create({
      user: username,
      amount,
      days,
      percent,
      expected_return: expectedReturn,
      status: "approved",
      paid_at: paidAt,
      maturity_date: maturityDate,
      moved_to_balance: false
    });

    res.json({
      detail: "Investment created successfully",
      investment
    });
  } catch (err) {
    console.error("INVEST ERROR:", err);
    res.status(500).json({ error: "Investment failed" });
  }
});

/* ======================================================
   MOVE INVESTMENT TO BALANCE (ON MATURITY)
====================================================== */
router.post("/move-to-balance/:id", auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment)
      return res.status(404).json({ error: "Investment not found" });

    if (investment.user !== req.user.username)
      return res.status(403).json({ error: "Unauthorized" });

    if (investment.status !== "completed")
      return res.status(400).json({ error: "Investment not yet matured" });

    if (investment.moved_to_balance)
      return res.status(400).json({ error: "Already released" });

    /* 💰 CREDIT PRINCIPAL */
    await Transaction.create({
      user_id: investment.user,
      type: "credit",
      amount: investment.amount,
      status: "completed",
      description: "Investment principal"
    });

    /* 💸 CREDIT PROFIT */
    const profit =
      investment.expected_return - investment.amount;

    if (profit > 0) {
      await Transaction.create({
        user_id: investment.user,
        type: "credit",
        amount: profit,
        status: "completed",
        description: "Investment profit"
      });
    }

    investment.moved_to_balance = true;
    await investment.save();

    res.json({ detail: "Funds released successfully" });
  } catch (err) {
    console.error("MOVE ERROR:", err);
    res.status(500).json({ error: "Release failed" });
  }
});


/* ======================================================
   GET MY INVESTMENTS
====================================================== */
router.get("/my", auth, async (req, res) => {
  try {
    const investments = await Investment.find({
      user: req.user.username
    }).sort({ created_at: -1 });

    res.json(investments);
  } catch (err) {
    console.error("FETCH INVESTMENTS ERROR:", err);
    res.status(500).json({ error: "Failed to load investments" });
  }
});


module.exports = router;
