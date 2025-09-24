// middleware/requireRole.js
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Make sure user exists (set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }

      // User has required role → proceed
      next();
    } catch (err) {
      console.error('requireRole Middleware Error:', err.message);
      return res.status(500).json({ message: 'Server error in role check' });
    }
  };
};
