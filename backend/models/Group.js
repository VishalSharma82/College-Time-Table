// backend/models/Group.js
const mongoose = require("mongoose");

// We'll define more detailed sub-schemas to hold rich data
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    abbreviation: { type: String, required: true },
    isLab: { type: Boolean, default: false }, // Is it a lab subject?
    periodsPerWeek: { type: Number, required: true },
});

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true }, // The subject they teach
    // A teacher's constraints can be added later
});

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
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

        // New, structured timetable fields
        subjects: [subjectSchema],
        teachers: [teacherSchema],
        classes: [classSchema],
        timetable: [timetableDaySchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);