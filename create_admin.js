require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    const username = "admin";
    const email = "admin@localinvest.ng";
    const plainPassword = "admin123";

    const existing = await User.findOne({ username });
    if (existing) {
      console.log("❌ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await User.create({
      username,
      email,                     // ✅ REQUIRED
      password: hashedPassword,  // ✅ REQUIRED
      address: "Head Office",
      is_admin: true,
      balance: 0,
      locked_balance: 0,
      total_credits: 0,
      total_debits: 0
    });

    console.log("✅ Admin created successfully");
    console.log("👉 username: admin");
    console.log("👉 password: admin123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
