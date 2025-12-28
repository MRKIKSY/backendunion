// routes/notifyAdmin.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// POST /notify-admin
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json({ message: "User not found" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminEmail = "eluyefachambers@gmail.com";

    const mailOptions = {
      from: `"Local Invest NG" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `Payment Notification: ${user.username}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>User Payment Alert</h2>
          <p><strong>${user.username}</strong> has indicated that they have completed a payment.</p>
          <p>Email: ${user.email}</p>
          <p>Please verify and approve the payment accordingly.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: `Admin notified about ${user.username}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to notify admin" });
  }
});

module.exports = router;
