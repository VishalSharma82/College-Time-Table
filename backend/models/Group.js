const mongoose = require("mongoose");

// --- Subject (master list) ---
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  isLab: { type: Boolean, default: false },
});

// --- Teacher (can teach multiple subjects) ---
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [{ type: String }], // could later be ObjectId refs to subjects
});

// --- Subject assignment per class (with workload + teachers) ---
const subjectAssignmentSchema = new mongoose.Schema({
  subject: { type: String, required: true },      // subject abbreviation or id
  periods: { type: Number, required: true },      // ✅ periods per week for that class
  teachers: [{ type: String, default: [] }],      // multiple teachers supported
});

// --- Class (configuration + assigned subjects) ---
const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "CSE 3rd Year A"
  periodsPerDay: {
    Mon: { type: Number, default: 0 },
    Tue: { type: Number, default: 0 },
    Wed: { type: Number, default: 0 },
    Thu: { type: Number, default: 0 },
    Fri: { type: Number, default: 0 },
  },
  subjectsAssigned: [subjectAssignmentSchema],
});

// --- Timetable slot (1 cell in the timetable) ---
const timetableSlotSchema = new mongoose.Schema({
  period: Number,
  subject: String,
  teacher: String,
  room: String,
});

// --- Timetable day (all slots for one day) ---
const timetableDaySchema = new mongoose.Schema({
  day: String,                // e.g. "Mon"
  slots: [timetableSlotSchema],
});

// --- Group (main container for one college/department) ---
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

    // general config
    settings: {
      days: {
        type: [String],
        default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      },
      maxPeriods: { type: Number, default: 6 },
      rooms: { type: [String], default: ["101", "102", "LAB"] },
    },

    // core data
    subjects: [subjectSchema],   // subject master list
    teachers: [teacherSchema],   // teacher list
    classes: [classSchema],      // each class with workload assignments

    // ✅ timetable per class (Map: classId -> timetable days)
    timetable: {
      type: Map,
      of: [timetableDaySchema],
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
