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

// ✅ CORS fix for credentials
import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000", // development ke liye
  "https://college-time-table.onrender.com", // deployed frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Agar request ka origin allowed list me hai ya origin undefined hai (postman/local)
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
app.use("/api/groups", timetableRoutes); // ✅ Fix: We now mount the timetable routes under the /api/groups path

// MongoDB Connect + Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));