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

const allowedOrigins = [
  "https://college-timetable-system.onrender.com",
  "http://localhost:3000" // new live frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true, // allow cookies
  methods: ["GET","POST","PUT","DELETE","OPTIONS"], // explicitly allow methods
  allowedHeaders: ["Content-Type","Authorization"], // allow headers
}));



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/groups", timetableRoutes);

// Root route for testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// MongoDB Connect + Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
