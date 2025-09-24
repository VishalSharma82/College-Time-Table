const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;

    // Validate role
    const allowedRoles = ["admin", "faculty", "student"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Verify token using Google API
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ googleId, name, email, role });
    } else {
      if (!user.googleId) user.googleId = googleId;
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google login failed" });
  }
};

// Email/Number Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["admin","faculty","student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Email/Number Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
