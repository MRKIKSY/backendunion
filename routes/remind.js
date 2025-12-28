const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/auth");

// POST /remind
router.post("/", auth, async (req, res) => {
  try {
    const { username } = req.body;

    let user;

    if (username) {
      // Admin triggered a reminder for a specific user
      user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: "User not found" });
    } else {
      // Regular user sending reminder for self
      user = await User.findById(req.user.id);
      if (!user) return res.status(400).json({ message: "User not found" });
    }

    if (!user.email) return res.status(400).json({ message: "User email missing" });

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Local Invest NG" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reminder: Pending Investment Payment",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
          <h2 style="color: #1a73e8;">Hello ${user.username},</h2>
          <p>This is a friendly reminder that you have <strong>pending investment(s)</strong> waiting for payment.</p>
          <p>Please complete the payment at your earliest convenience so that we can approve your investment and ensure your benefits are unlocked.</p>
          <p style="margin-top: 20px;">If you have already completed the payment, please disregard this message.</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 0.9em; color: #555;">Thank you for trusting Local Invest NG. <br> For support, contact <a href="mailto:support@localinvest.ng">support@localinvest.ng</a>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: `Reminder sent to ${user.email}` });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send reminder" });
  }
});

module.exports = router;
