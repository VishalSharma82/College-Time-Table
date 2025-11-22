// backend/controllers/timetableController.js
const Group = require("../models/Group");

// --- addSubject ---
const addSubject = async (req, res) => {
  try {
    console.log("🔹 AddSubject API called with:", req.body);
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.subjects.push(req.body);
    await group.save();

    console.log("✅ Updated subjects:", group.subjects);
    res.json({ subjects: group.subjects });
  } catch (error) {
    console.error("❌ Backend error in addSubject:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.configureTimetableData = async (req, res) => {
  try {
    const { subjects, teachers, classes } = req.body;

    // Assumes req.group is available via middleware (e.g., isGroupOwner)
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

    // --- Step 1: Validation & defaults (No change needed) ---
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
          `Input Error: For class '${cls.name}', total available periods (${totalAvailable}) do not match total periods assigned to subjects (${totalAssigned}). Please fix this in Step 3.`
        );
      }
    }

    // --- Step 2: Flatten all assignments with priority ---
    let allAssignments = [];
    group.classes.forEach((classEntry) => {
      classEntry.subjectsAssigned.forEach((assignment) => {
        const subjectDetail = group.subjects.find(
          (s) => s.abbreviation === assignment.subject
        );
        const isLab = subjectDetail?.isLab || false;

        for (let i = 0; i < assignment.periods; i++) {
          allAssignments.push({
            class: classEntry.name,
            // 🚀 FIX: Assign the subject NAME instead of the abbreviation for display clarity
            subject: subjectDetail?.name || assignment.subject, 
            teacher: assignment.teacher,
            isLab: isLab,
          });
        }
      });
    });

    // Sort assignments by periods and teacher workload to prioritize placement
    allAssignments.sort((a, b) => {
      const aTeacherWorkload = allAssignments.filter(
        (assign) => assign.teacher === a.teacher
      ).length;
      const bTeacherWorkload = allAssignments.filter(
        (assign) => assign.teacher === b.teacher
      ).length;
      return bTeacherWorkload - aTeacherWorkload;
    });

    const totalAssignments = allAssignments.length;
    const attempts = 30;

    // --- Step 3: Timetable generation with multi-attempt greedy algorithm ---
    for (let attempt = 0; attempt < attempts; attempt++) {
      const masterTimetable = {};

      group.classes.forEach((cls) => {
        masterTimetable[cls.name] = days.map((day) => ({
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

      let scheduledCount = 0;
      // Shuffle the assignments on every attempt
      const assignmentsToSchedule = [...allAssignments].sort(
        () => Math.random() - 0.5
      );
      let success = true;

      for (const assignment of assignmentsToSchedule) {
        let placed = false;
        const classEntry = group.classes.find(
          (c) => c.name === assignment.class
        );

        // Find all valid slots for the current assignment
        const validSlots = [];
        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
          const day = days[dayIndex];
          const dailyPeriods = classEntry.periodsPerDay[day];
          if (dailyPeriods === 0) continue;

          for (let periodIndex = 0; periodIndex < dailyPeriods; periodIndex++) {
            const period = periodIndex + 1;
            const isTeacherBusy = teacherOccupancy[`${day}-${period}`].has(
              assignment.teacher
            );
            const isSlotOccupied =
              masterTimetable[classEntry.name][dayIndex].slots[periodIndex]
                .subject !== null;

            if (!isTeacherBusy && !isSlotOccupied) {
              validSlots.push({ dayIndex, periodIndex });
            }
          }
        }

        // If there are valid slots, place the assignment
        if (validSlots.length > 0) {
          const randomSlot =
            validSlots[Math.floor(Math.random() * validSlots.length)];
          const { dayIndex, periodIndex } = randomSlot;
          const day = days[dayIndex];
          const period = periodIndex + 1;

          const slot =
            masterTimetable[classEntry.name][dayIndex].slots[periodIndex];
          
          // 🚀 slot.subject now correctly receives the Subject NAME
          slot.subject = assignment.subject; 
          
          slot.teacher = assignment.teacher;
          slot.room = assignment.isLab
            ? rooms.find((r) => r.includes("LAB")) || "LAB"
            : rooms.find((r) => !r.includes("LAB")) || "N/A";

          teacherOccupancy[`${day}-${period}`].add(assignment.teacher);
          scheduledCount++;
          placed = true;
        }

        if (!placed) {
          success = false;
          break;
        }
      }

      if (success && scheduledCount === totalAssignments) {
        // TimeTable for the first class (Array of Days)
        const finalTimetable = masterTimetable[group.classes[0].name].map(
          (dayEntry) => ({
            day: dayEntry.day,
            slots: dayEntry.slots.slice(
              0,
              group.classes[0].periodsPerDay[dayEntry.day]
            ),
          })
        );

        // Assign the generated Array directly to group.timetable (FIXED STRUCTURE)
        group.timetable = finalTimetable;
        await group.save();
        return res.json({
          message: "Timetable generated ✅",
          timetable: finalTimetable,
        });
      }
    }

    throw new Error(
      `Generation Failure: Could not find a valid timetable after ${attempts} attempts. This could be due to a scheduling conflict. Check your data.`
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

    // FIX APPLIED: Direct assignment of the Array of Days to req.group.timetable (Correct structure)
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

exports.addSubject = addSubject;