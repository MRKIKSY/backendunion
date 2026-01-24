const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const investRoutes = require("./routes/invest");
const remindRoute = require("./routes/remind");
const notifyAdminRoute = require("./routes/notifyAdmin");
const investCancelRoute = require("./routes/investCancel");
const adminApproveInvestment = require("./routes/adminApproveInvestment");
const adminApproveWithdrawal = require("./routes/adminApproveWithdrawal");
const payRoutes = require("./routes/pay");

// Middleware
const { auth } = require("./middleware/auth");

const app = express();

/* =======================
   Middleware
======================= */
app.use(express.json());

app.use(
  cors({
    origin: "https://frontend-xm7h.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =======================
   Routes
======================= */
app.use("/auth", authRoutes);
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/invest", investRoutes);

// Protected route
app.use("/remind", auth, remindRoute);

// Other routes
app.use("/notify-admin", notifyAdminRoute);
app.use("/invest", investCancelRoute);
app.use("/invest/admin", adminApproveInvestment);
app.use("/admin", adminApproveWithdrawal);
app.use("/pay", payRoutes);

/* =======================
   MongoDB + Server Start
======================= */
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start cron AFTER DB connects
    require("./cron/investmentCron");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
