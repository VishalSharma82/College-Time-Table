const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const timetableRoutes = require("./routes/timetableRoutes");

dotenv.config();

const app = express();

// ✅ TRUST RENDER PROXY
app.set("trust proxy", 1);

// ✅ MIDDLEWARE
const allowedOrigins = [
  "https://college-timetable-system.onrender.com",
  "http://localhost:3000"
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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
}));

// Handle preflight requests for all routes
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/timetables", timetableRoutes);

// ✅ ROOT TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ✅ DATABASE + SERVER START
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
