const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * ======================
 * AUTH MIDDLEWARE
 * ======================
 */
const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      detail: "Unauthorized"
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({ username: decoded.sub });
    if (!user) {
      return res.status(401).json({
        detail: "Invalid token"
      });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({
      detail: "Invalid token"
    });
  }
};

/**
 * ======================
 * ADMIN ONLY
 * ======================
 */
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({
      detail: "Admin access required"
    });
  }
  next();
};

module.exports = { auth, adminOnly };
