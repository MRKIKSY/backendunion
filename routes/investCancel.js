const express = require("express");
const router = express.Router();
const Investment = require("../models/Investment");
const { auth } = require("../middleware/auth");

// POST /invest/cancel/:id
router.post("/cancel/:id", auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ detail: "Investment not found" });
    }

    // ✅ FIX: ownership check uses username
    if (investment.user !== req.user.username) {
      return res.status(403).json({ detail: "Unauthorized action" });
    }

    // Only pending investments can be cancelled
    if (investment.status !== "pending") {
      return res
        .status(400)
        .json({ detail: "Only pending investments can be cancelled" });
    }

    await investment.deleteOne();

    return res.json({ detail: "Investment cancelled successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Failed to cancel investment" });
  }
});

module.exports = router;
