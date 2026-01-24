const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
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
   PostgreSQL Connection
======================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // REQUIRED on Render
  },
});

// Make pool available everywhere
app.set("db", pool);

// Test DB connection
pool
  .query("SELECT 1")
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  });

/* =======================
   Routes
======================= */
app.use("/auth", authRoutes);
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/invest", investRoutes);

// Protected routes
app.use("/remind", auth, remindRoute);

// Other routes
app.use("/notify-admin", notifyAdminRoute);
app.use("/invest", investCancelRoute);
app.use("/invest/admin", adminApproveInvestment);
app.use("/admin", adminApproveWithdrawal);
app.use("/pay", payRoutes);

/* =======================
   Start Server
======================= */
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
