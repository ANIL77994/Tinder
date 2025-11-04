const jwt = require("jsonwebtoken");
const User = require("../models/users")

const useAuth =async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }
    const decoded = await jwt.verify(token, "Anildata!@#!");
    req.user = decoded;
    const userData = await User.findById(req.user._id).select("-password");
    req.user = userData
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = useAuth;
