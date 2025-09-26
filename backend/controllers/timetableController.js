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

    // --- Step 1: Dynamic Config ---
    const days = group.settings?.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const maxPeriods = group.settings?.maxPeriods || 6;
    const rooms = group.settings?.rooms || ["101", "102", "LAB-306"];

    // --- Step 2: Validation ---
    if (!group.classes || group.classes.length === 0) {
      throw new Error(
        `Input Error: You must define at least one class in Step 3.`
      );
    }

    for (const classEntry of group.classes) {
      const totalAvailableSlots = Object.values(
        classEntry.periodsPerDay
      ).reduce((sum, p) => sum + p, 0);
      const totalAssignedPeriods = classEntry.subjectsAssigned.reduce(
        (sum, sa) => sum + sa.periods,
        0
      );

      if (totalAvailableSlots !== totalAssignedPeriods) {
        throw new Error(
          `Input Error: For class '${classEntry.name}', total available periods (${totalAvailableSlots}) do not match total periods assigned to subjects (${totalAssignedPeriods}). Please fix this in Step 3.`
        );
      }
    }

    // --- Step 3: Prepare Assignment Pool ---
    const allAssignments = [];
    group.classes.forEach((classEntry) => {
      classEntry.subjectsAssigned.forEach((assignment) => {
        const subjectConfig = group.subjects.find(
          (s) => s.abbreviation === assignment.subject
        );
        const isLab = subjectConfig?.isLab || false;

        let teacherList = Array.isArray(assignment.teacher)
          ? assignment.teacher
          : [assignment.teacher];

        for (let i = 0; i < assignment.periods; i++) {
          const teacher = teacherList[i % teacherList.length]; // Round-robin
          allAssignments.push({
            class: classEntry.name,
            subject: assignment.subject,
            teacher,
            isLab,
          });
        }
      });
    });

    const totalAssignments = allAssignments.length;
    const attempts = 30;

    // --- Step 4: Try Multiple Schedules ---
    for (let attempt = 0; attempt < attempts; attempt++) {
      let masterTimetable = {};
      group.classes.forEach((classEntry) => {
        masterTimetable[classEntry.name] = days.map((day) => ({
          day,
          slots: Array(maxPeriods)
            .fill(null)
            .map((_, i) => ({
              period: i + 1,
              subject: null,
              teacher: null,
              room: null,
            })),
        }));
      });

      let teacherOccupancy = {};
      for (const day of days) {
        for (let period = 1; period <= maxPeriods; period++) {
          teacherOccupancy[`${day}-${period}`] = new Set();
        }
      }

      const assignmentsToSchedule = [...allAssignments].sort(
        () => Math.random() - 0.5
      );
      let scheduledCount = 0;

      for (const assignment of assignmentsToSchedule) {
        let placed = false;
        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
          const day = days[dayIndex];
          const classEntry = group.classes.find(
            (c) => c.name === assignment.class
          );

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
              const slot =
                masterTimetable[classEntry.name][dayIndex].slots[periodIndex];
              slot.subject = assignment.subject;
              slot.teacher = assignment.teacher;
              slot.room = assignment.isLab
                ? rooms.find((r) => r.includes("LAB")) || "LAB"
                : rooms.find((r) => !r.includes("LAB")) || "N/A";

              teacherOccupancy[`${day}-${period}`].add(assignment.teacher);
              scheduledCount++;
              placed = true;
              break;
            }
          }
          if (placed) break;
        }

        if (!placed) {
          // fallback: mark unassigned
          const fallbackDay = days[0];
          masterTimetable[assignment.class][0].slots[0] = {
            period: 1,
            subject: assignment.subject,
            teacher: "Unassigned",
            room: "N/A",
          };
        }
      }

      if (scheduledCount === totalAssignments) {
        group.timetable = masterTimetable;
        await group.save();
        return res.json({
          message: "Timetable generated successfully ✅",
          timetable: masterTimetable,
        });
      }
    }

    throw new Error(
      `Generation Failure: Could not find a valid timetable after ${attempts} attempts. This could be due to a scheduling conflict.`
    );
  } catch (err) {
    console.error("Error generating timetable:", err);
    res
      .status(500)
      .json({ message: err.message || "Error generating timetable" });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const { timetable } = req.body;

    if (!timetable) {
      return res.status(400).json({ message: "Timetable data is required." });
    }

    req.group.timetable = timetable;
    await req.group.save();

    res.json({
      message: "Timetable updated successfully.",
      timetable: req.group.timetable,
    });
  } catch (err) {
    console.error("Error updating timetable:", err);
    res.status(500).json({ message: "Error updating timetable." });
  }
};
