// backend/controllers/timetableController.js
const Group = require("../models/Group");

exports.configureTimetableData = async (req, res) => {
    try {
        const { subjects, teachers, classes } = req.body;
        
        req.group.subjects = subjects || [];
        req.group.teachers = teachers || [];
        req.group.classes = classes || [];
        
        await req.group.save();

        res.json({ message: "Timetable data saved successfully", group: req.group });
    } catch (err) {
        console.error("Error saving timetable data:", err);
        res.status(500).json({ message: "Error saving timetable data" });
    }
};

exports.generateTimetable = async (req, res) => {
    try {
        const group = req.group;
        
        // 1. Prepare all required class assignments
        let assignments = [];
        group.subjects.forEach(subject => {
            const teacher = group.teachers.find(t => t.subject === subject.name);
            if (!teacher) {
                throw new Error(`No teacher found for subject: ${subject.name}`);
            }
            // Create an entry for each period required
            for (let i = 0; i < subject.periodsPerWeek; i++) {
                assignments.push({
                    subject: subject.abbreviation,
                    teacher: teacher.name,
                    isLab: subject.isLab,
                });
            }
        });

        // 2. Initialize the empty timetable structure
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const periods = 6;
        let timetable = days.map(day => ({
            day,
            slots: Array(periods).fill(null).map((_, i) => ({
                period: i + 1,
                subject: null,
                teacher: null,
                room: null
            }))
        }));

        // 3. Simple Greedy Algorithm
        let assignmentIndex = 0;
        for (let day of days) {
            for (let period = 0; period < periods; period++) {
                if (assignmentIndex >= assignments.length) break;

                const currentAssignment = assignments[assignmentIndex];
                
                // Find a free slot for the current assignment
                // We'll just place it directly since we don't have complex constraints yet
                const slot = timetable.find(d => d.day === day).slots[period];

                // Check if the slot is occupied by a specific teacher for another subject
                const isTeacherOccupied = timetable.some(d => 
                    d.day === day && 
                    d.slots[period] && 
                    d.slots[period].teacher === currentAssignment.teacher
                );

                if (!isTeacherOccupied) {
                    slot.subject = currentAssignment.subject;
                    slot.teacher = currentAssignment.teacher;
                    slot.room = currentAssignment.isLab ? "LAB-306" : "310"; // Simple hardcoded rooms
                    assignmentIndex++;
                }
            }
        }
        
        // Final check to see if all assignments were scheduled
        if (assignmentIndex < assignments.length) {
            throw new Error("Could not schedule all classes with the given constraints.");
        }

        // 4. Clean up the timetable for empty slots
        const finalTimetable = timetable.map(dayEntry => ({
            ...dayEntry,
            slots: dayEntry.slots.map(slot => ({
                period: slot.period,
                subject: slot.subject || "Free",
                teacher: slot.teacher || "N/A",
                room: slot.room || "N/A"
            }))
        }));

        group.timetable = finalTimetable;
        await group.save();

        res.json({ message: "Timetable generated successfully", timetable: finalTimetable });
    } catch (err) {
        console.error("Error generating timetable:", err);
        res.status(500).json({ message: err.message || "Error generating timetable" });
    }
};