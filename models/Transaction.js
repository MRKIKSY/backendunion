const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user_id: String,
  type: String, // credit | debit
  amount: Number,
  description: String,

  routing_number: String,
  account_number: String,
  check_number: String,
  reference: String,

  status: { type: String, default: "pending" },

  is_bonus: { type: Boolean, default: false }, // 🔒 SIGNUP BONUS FLAG

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
