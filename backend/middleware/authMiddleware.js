const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("❌ No token received");
      return res.status(401).json({ message: "No token" });
    }

    console.log("✅ Token received");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ JWT verified:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    console.log("✅ User:", user);

    req.user = user;

    next();
  } catch (err) {
    console.log("FULL ERROR:");
    console.log(err);

    return res.status(401).json({
      message: "Token failed",
      error: err.message,
    });
  }
};

module.exports = { protect };