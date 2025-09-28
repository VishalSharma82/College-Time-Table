const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require('./routes/groupRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const timetableRoutes = require("./routes/timetableRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://college-time-table.onrender.com", // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/groups", timetableRoutes);

// ✅ Optional root route to test backend
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// MongoDB Connect + Start Server
const PORT = process.env.PORT || 5000; // Use Render's port or fallback to 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
