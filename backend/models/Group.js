const mongoose = require("mongoose");

// --- Subject ---periodsPerWeek
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  isLab: { type: Boolean, default: false }
});

// --- Teacher ---
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [{ type: String }],
});

// --- Subject assignment per class ---
const subjectAssignmentSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  periods: { type: Number, required: true },
  teachers: [{ type: String, default: [] }], // ✅ multiple teachers supported
});

// --- Class ---
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  periodsPerDay: {
    Mon: { type: Number, default: 0 },
    Tue: { type: Number, default: 0 },
    Wed: { type: Number, default: 0 },
    Thu: { type: Number, default: 0 },
    Fri: { type: Number, default: 0 },
  },
  subjectsAssigned: [subjectAssignmentSchema],
});

// --- Timetable slot ---
const timetableSlotSchema = new mongoose.Schema({
  period: Number,
  subject: String,
  teacher: String,
  room: String,
});

// --- Timetable day ---
const timetableDaySchema = new mongoose.Schema({
  day: String,
  slots: [timetableSlotSchema],
});

// --- Group ---
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    passwordHash: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: true },

    // config
    settings: {
      days: [{ type: String, default: ["Mon", "Tue", "Wed", "Thu", "Fri"] }],
      maxPeriods: { type: Number, default: 6 },
      rooms: [{ type: String, default: ["101", "102", "LAB"] }],
    },

    subjects: [subjectSchema],
    teachers: [teacherSchema],
    classes: [classSchema],

    // ✅ timetable per class
    timetable: {
      type: Map,
      of: [timetableDaySchema],
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
