const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require('./routes/groupRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// ✅ CORS fix for credentials
app.use(cors({
  origin: 'http://localhost:3000', // frontend ka exact origin
  credentials: true,               // cookies ko allow karne ke liye
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/resources", resourceRoutes);

// MongoDB Connect + Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
