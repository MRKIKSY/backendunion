const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const sendAdminEmail = require("../utils/sendAdminEmail");
const { auth, adminOnly } = require("../middleware/auth");

// POST /approve/:id
router.post("/approve/:id", auth, adminOnly, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ detail: "Transaction not found" });

    tx.status = "approved";
    await tx.save();

    const user = await User.findOne({ username: tx.user_id });
    if (user?.email) {
      console.log("Sending email to:", user.email);

      try {
        await sendAdminEmail({
          to: user.email,
          subject: "Withdrawal Processed Successfully",
          html: `
            <p>Dear ${user.username},</p>
            <p>Your withdrawal request has been successfully processed.</p>
            <p>Funds have been sent to your registered bank account.</p>
            <p>— LOCAL INVEST NG Team</p>
          `,
        });
        console.log("Email sent successfully");
      } catch (emailErr) {
        console.error("Error sending email:", emailErr);
      }
    }

    res.json({ detail: "Withdrawal approved and email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Approval failed" });
  }
});

module.exports = router;
