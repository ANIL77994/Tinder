const jwt = require("jsonwebtoken");
const User = require("../models/users")



const useAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies; // 1️⃣ Read token from cookies
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // 2️⃣ Verify token validity
    const secret = process.env.SECRATEKEY || "dev_secret_key_tinder_default";
    const decoded = await jwt.verify(token, secret); 

    // 3️⃣ If verification passed, attach user info
    req.user = decoded;

    // 4️⃣ Find user in DB and attach to request
    const userData = await User.findById(req.user._id).select("-password");
    req.user = userData;

    // 5️⃣ Pass control to next middleware or route
    next();

  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Auth Error:", error.message);
    }
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = useAuth;

