// backend/controllers/timetableController.js
const Group = require("../models/Group");

const addSubject = async (req, res) => {
  try {
    console.log("🔹 AddSubject API called with:", req.body); // 👈 Debug
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.subjects.push(req.body); // 👈 Add subject
    await group.save();

    console.log("✅ Updated subjects:", group.subjects); // 👈 Debug
    res.json({ subjects: group.subjects });
  } catch (error) {
    console.error("❌ Backend error in addSubject:", error); // 👈 Debug
    res.status(500).json({ message: "Server Error" });
  }
};
exports.configureTimetableData = async (req, res) => {
  try {
    const { subjects, teachers, classes } = req.body;

    req.group.subjects = subjects || [];
    req.group.teachers = teachers || [];
    req.group.classes = classes || [];

    await req.group.save();

    res.json({
      message: "Timetable data saved successfully",
      group: req.group,
    });
  } catch (err) {
    console.error("Error saving timetable data:", err);
    res.status(500).json({ message: "Error saving timetable data" });
  }
};

exports.generateTimetable = async (req, res) => {
  try {
    const group = req.group;

    const days = group.settings?.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const maxPeriods = group.settings?.maxPeriods || 6;
    const rooms = group.settings?.rooms || ["101", "102", "LAB-306"];

    if (!group.classes || group.classes.length === 0) {
      throw new Error("You must define at least one class.");
    }

    // --- Step 1: Validation & defaults ---
    for (const cls of group.classes) {
      cls.periodsPerDay = cls.periodsPerDay || {};
      days.forEach((day) => {
        if (!cls.periodsPerDay[day]) cls.periodsPerDay[day] = 0;
      });

      cls.subjectsAssigned = cls.subjectsAssigned || [];

      const totalAvailable = Object.values(cls.periodsPerDay).reduce(
        (sum, p) => sum + (p || 0),
        0
      );
      const totalAssigned = cls.subjectsAssigned.reduce(
        (sum, sa) => sum + (sa.periods || 0),
        0
      );

      if (totalAvailable !== totalAssigned) {
        throw new Error(
          `Class '${cls.name}' mismatch: available periods (${totalAvailable}) != assigned periods (${totalAssigned}).`
        );
      }
    }

    // --- Step 2: Flatten all assignments ---
    const assignments = [];
    group.classes.forEach((cls) => {
      cls.subjectsAssigned.forEach((sub) => {
        if (!sub.teacher || !sub.periods) return;

        const teachers = Array.isArray(sub.teacher)
          ? sub.teacher
          : [sub.teacher];

        for (let i = 0; i < sub.periods; i++) {
          assignments.push({
            class: cls.name,
            subject: sub.subject,
            teacher: teachers[i % teachers.length],
            isLab:
              group.subjects.find((s) => s.abbreviation === sub.subject)
                ?.isLab || false,
          });
        }
      });
    });

    const totalAssignments = assignments.length;
    const attempts = 30;

    // --- Step 3: Timetable generation ---
    for (let attempt = 0; attempt < attempts; attempt++) {
      const timetable = {};

      // Initialize empty timetable structure
      group.classes.forEach((cls) => {
        timetable[cls.name] = days.map((day) => ({
          day,
          slots: Array(maxPeriods)
            .fill(null)
            .map((_, i) => ({
              period: i + 1,
              subject: null,
              teacher: null,
              room: null,
              isLab: false,
            })),
        }));
      });

      const teacherOccupancy = {};
      days.forEach((day) => {
        for (let p = 1; p <= maxPeriods; p++) {
          teacherOccupancy[`${day}-${p}`] = new Set();
        }
      });

      let scheduled = 0;

      // Shuffle assignments randomly
      const shuffled = [...assignments].sort(() => Math.random() - 0.5);

      for (const assign of shuffled) {
        const cls = group.classes.find((c) => c.name === assign.class);
        let placed = false;

        for (let d = 0; d < days.length; d++) {
          const day = days[d];
          const dailyPeriods = cls.periodsPerDay[day] || 0;
          if (dailyPeriods === 0) continue;

          for (let p = 0; p < dailyPeriods; p++) {
            const slot = timetable[cls.name][d].slots[p];

            if (
              !slot.subject &&
              !teacherOccupancy[`${day}-${p + 1}`].has(assign.teacher)
            ) {
              slot.subject = assign.subject;
              slot.teacher = assign.teacher;
              slot.room = assign.isLab
                ? rooms.find((r) => r.includes("LAB")) || "LAB"
                : rooms.find((r) => !r.includes("LAB")) || "N/A";
              slot.isLab = assign.isLab;

              teacherOccupancy[`${day}-${p + 1}`].add(assign.teacher);
              scheduled++;
              placed = true;
              break;
            }
          }
          if (placed) break;
        }

        // fallback if not placed
        if (!placed) {
          timetable[cls.name][0].slots[0] = {
            period: 1,
            subject: assign.subject,
            teacher: "Unassigned",
            room: "N/A",
            isLab: assign.isLab,
          };
        }
      }

      if (scheduled === totalAssignments) {
        group.timetable = timetable;
        await group.save();
        return res.json({ message: "Timetable generated ✅", timetable });
      }
    }

    throw new Error(
      `Could not generate a valid timetable after ${attempts} attempts.`
    );
  } catch (err) {
    console.error("Timetable generation error:", err);
    res
      .status(500)
      .json({ message: err.message || "Error generating timetable" });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const { timetable } = req.body;
    if (!timetable)
      return res.status(400).json({ message: "Timetable is required." });

    req.group.timetable = timetable;
    await req.group.save();

    res.json({
      message: "Timetable updated ✅",
      timetable: req.group.timetable,
    });
  } catch (err) {
    console.error("Error updating timetable:", err);
    res.status(500).json({ message: "Error updating timetable" });
  }
};
