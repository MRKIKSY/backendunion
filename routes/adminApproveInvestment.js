const express = require("express");
const router = express.Router();
const Investment = require("../models/Investment");
const User = require("../models/User");
const sendAdminEmail = require("../utils/sendAdminEmail");
const { auth, adminOnly } = require("../middleware/auth");

router.post("/approve/:id", auth, adminOnly, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) return res.status(404).json({ detail: "Investment not found" });

    investment.status = "approved";
    await investment.save();

    const user = await User.findOne({ username: investment.user });
    if (user?.email) {
      const info = await sendAdminEmail({
        to: user.email,
        subject: "Investment Approved & Payment Processed",
        html: `<p>Dear ${user.username}, your investment is approved.</p>`,
      });
      console.log("Email sent:", info.messageId); // ✅ log to see if it actually sent
    }

    res.json({ detail: "Investment approved and email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Approval failed" });
  }
});

module.exports = router;
