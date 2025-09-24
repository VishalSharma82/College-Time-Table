const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // Token from cookie or Authorization header
    const token =
      req.cookies?.token ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      console.warn("No token provided");
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.error("JWT verification failed:", jwtErr.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!decoded?.id) {
      console.error("Decoded token missing ID:", decoded);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Fetch user from DB to ensure still valid
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn("User not found for token ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user info to request, ensure id exists
    req.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };

    // Debug
    console.log("Auth Middleware: user attached", req.user);

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
