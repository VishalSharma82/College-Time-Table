// backend/models/Group.js
const mongoose = require("mongoose");

// We'll define more detailed sub-schemas to hold rich data
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    abbreviation: { type: String, required: true },
    isLab: { type: Boolean, default: false },
    periodsPerWeek: { type: Number, required: true },
});

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subjects: [{ type: String }],
});

const subjectAssignmentSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    periods: { type: Number, required: true },
    teacher: { type: String, default: null } // ✅ Fixed: The teacher field is no longer required and defaults to null.
});

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    periodsPerDay: {
        Mon: { type: Number, default: 0 },
        Tue: { type: Number, default: 0 },
        Wed: { type: Number, default: 0 },
        Thu: { type: Number, default: 0 },
        Fri: { type: Number, default: 0 },
    },
    subjectsAssigned: [subjectAssignmentSchema]
});

// Timetable schema for a slot
const timetableSlotSchema = new mongoose.Schema({
    period: Number,
    subject: String,
    teacher: String,
    room: String,
});

// Timetable schema for a day
const timetableDaySchema = new mongoose.Schema({
    day: String,
    slots: [timetableSlotSchema],
});

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
        subjects: [subjectSchema],
        teachers: [teacherSchema],
        classes: [classSchema],
        timetable: [timetableDaySchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);