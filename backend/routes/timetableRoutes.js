// backend/routes/timetableRoutes.js
const express = require("express");
const protect = require("../middleware/authMiddleware");

const isGroupOwner = require("../middleware/isGroupOwner");
const {
  configureTimetableData,
  generateTimetable,
} = require("../controllers/timetableController");

const router = express.Router();

// Configure timetable data (subjects, teachers, etc.) for a specific group
router.post("/:id/configure-timetable", protect, isGroupOwner, configureTimetableData);

// Generate the timetable for a specific group
router.post("/:id/generate-timetable", protect, isGroupOwner, generateTimetable);

module.exports = router;