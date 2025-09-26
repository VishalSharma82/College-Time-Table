// backend/routes/groupRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const isGroupOwner = require("../middleware/isGroupOwner");
const Group = require("../models/Group");
const { updateTimetable } = require("../controllers/timetableController");

const router = express.Router();

/**
 * CREATE GROUP (admin only)
 */
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, password, isPrivate = true } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    const existing = await Group.findOne({ name, owner: req.user.id });
    if (existing) return res.status(400).json({ message: "Group with that name already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const group = new Group({
      name,
      description,
      owner: req.user.id,
      passwordHash,
      isPrivate,
      members: [req.user.id],
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Server error while creating group", error: err.message });
  }
});

/**
 * GET AVAILABLE GROUPS
 */
router.get("/available", auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: { $ne: req.user.id } }).select(
      "name description owner isPrivate"
    );
    res.json(groups);
  } catch (err) {
    console.error("Error fetching available groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * JOIN GROUP
 */
router.post("/join", auth, async (req, res) => {
  try {
    const { groupId, password } = req.body;
    if (!groupId || !password) {
      return res.status(400).json({ message: "Group ID and password are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.id)) {
      return res.status(200).json({ message: "Already a member", group });
    }

    const match = await bcrypt.compare(password, group.passwordHash);
    if (!match) return res.status(403).json({ message: "Invalid password" });

    group.members.push(req.user.id);
    await group.save();

    res.json({ message: "Joined group successfully", group });
  } catch (err) {
    console.error("Error joining group:", err);
    res.status(500).json({ message: "Server error while joining group", error: err.message });
  }
});

/**
 * GET OWNED GROUPS
 */
router.get("/mine", auth, requireRole("admin"), async (req, res) => {
  try {
    const groups = await Group.find({ owner: req.user.id }).populate(
      "members",
      "name email role"
    );
    res.json(groups);
  } catch (err) {
    console.error("Error fetching owned groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET JOINED GROUPS
 */
router.get("/joined", auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate(
      "owner",
      "name email role"
    );
    res.json(groups);
  } catch (err) {
    console.error("Error fetching joined groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET SINGLE GROUP (owner only)
 */
router.get("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

    const group = await Group.findById(id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "You do not have permission to view this group" });
    }

    res.json(group);
  } catch (err) {
    console.error("Error fetching group by ID:", err);
    res.status(500).json({ message: "Server error while fetching group", error: err.message });
  }
});

/**
 * UPDATE GROUP
 */
router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner.toString() !== req.user.id) return res.status(403).json({ message: "Only owner can update this group" });

    const { name, description, password } = req.body;
    if (name) group.name = name;
    if (description) group.description = description;
    if (password) group.passwordHash = await bcrypt.hash(password, 10);

    await group.save();
    res.json({ message: "Group updated successfully", group });
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * DELETE GROUP
 */
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner.toString() !== req.user.id) return res.status(403).json({ message: "Only owner can delete this group" });

    await group.deleteOne();
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "Server error while deleting group", error: err.message });
  }
});

/**
 * VIEW GROUP (any member)
 */
router.get("/:id/view", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

    const group = await Group.findById(id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.some((m) => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    res.json({
      name: group.name,
      owner: group.owner,
      subjects: group.subjects,
      teachers: group.teachers,
      classes: group.classes,
      timetable: group.timetable,
      constraints: group.constraints,
    });
  } catch (err) {
    console.error("Error fetching group view:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * -------------------------
 * SUBJECT ROUTES
 * -------------------------
 */

// ADD SUBJECT
router.post("/:id/subjects", auth, requireRole("admin"), isGroupOwner, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

    const { name, abbreviation, isLab } = req.body;
    if (!name || !abbreviation) return res.status(400).json({ message: "Name and Abbreviation are required" });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.subjects.push({ name, abbreviation, isLab: isLab ?? false });
    await group.save();

    res.status(201).json({ message: "Subject added successfully", subjects: group.subjects });
  } catch (err) {
    console.error("❌ Error adding subject:", err);
    res.status(500).json({ message: "Server error while adding subject", error: err.message });
  }
});

// UPDATE SUBJECT
router.put("/:id/subjects/:subjectId", auth, requireRole("admin"), isGroupOwner, async (req, res) => {
  try {
    const { id, subjectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid ID(s)" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const subject = group.subjects.id(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const { name, abbreviation, isLab } = req.body;
    if (!name && !abbreviation && isLab === undefined) {
      return res.status(400).json({ message: "At least one field required to update" });
    }

    Object.assign(subject, req.body);
    await group.save();

    res.json({ message: "Subject updated", subjects: group.subjects });
  } catch (err) {
    console.error("❌ Error updating subject:", err);
    res.status(500).json({ message: "Server error while updating subject", error: err.message });
  }
});

// DELETE SUBJECT
router.delete("/:id/subjects/:subjectId", auth, requireRole("admin"), isGroupOwner, async (req, res) => {
  try {
    const { id, subjectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid ID(s)" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const initialLength = group.subjects.length;
    group.subjects = group.subjects.filter(s => s._id.toString() !== subjectId);
    if (group.subjects.length === initialLength) return res.status(404).json({ message: "Subject not found" });

    await group.save();
    res.json({ message: "Subject deleted", subjects: group.subjects });
  } catch (err) {
    console.error("❌ Error deleting subject:", err);
    res.status(500).json({ message: "Server error while deleting subject", error: err.message });
  }
});

/**
 * -------------------------
 * TEACHER ROUTES
 * -------------------------
 */

// ADD TEACHER
router.post("/:id/teachers", auth, requireRole("admin"), isGroupOwner, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

    const { name, subjects } = req.body;
    if (!name || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: "Teacher name and subjects are required" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.teachers.push({ name, subjects });
    await group.save();

    res.status(201).json({ message: "Teacher added", teachers: group.teachers });
  } catch (err) {
    console.error("❌ Error adding teacher:", err);
    res.status(500).json({ message: "Server error while adding teacher", error: err.message });
  }
});

// UPDATE TEACHER
router.put("/:id/teachers/:teacherId", auth, requireRole("admin"), isGroupOwner, async (req, res) => {
  try {
    const { id, teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid ID(s)" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const teacher = group.teachers.id(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const { name, subjects } = req.body;
    if (!name && (!subjects || !Array.isArray(subjects))) {
      return res.status(400).json({ message: "At least one field required to update" });
    }

    Object.assign(teacher, req.body);
    await group.save();

    res.json({ message: "Teacher updated", teachers: group.teachers });
  } catch (err) {
    console.error("❌ Error updating teacher:", err);
    res.status(500).json({ message: "Server error while updating teacher", error: err.message });
  }
});

// DELETE TEACHER
router.delete("/:id/teachers/:teacherId", auth, requireRole("admin"), isGroupOwner, async (req, res) => {
  try {
    const { id, teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid ID(s)" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const initialLength = group.teachers.length;
    group.teachers = group.teachers.filter(t => t._id.toString() !== teacherId);
    if (group.teachers.length === initialLength) return res.status(404).json({ message: "Teacher not found" });

    await group.save();
    res.json({ message: "Teacher deleted", teachers: group.teachers });
  } catch (err) {
    console.error("❌ Error deleting teacher:", err);
    res.status(500).json({ message: "Server error while deleting teacher", error: err.message });
  }
});

/**
 * TIMETABLE ROUTE
 */
router.patch("/:id/timetable", auth, requireRole("admin"), isGroupOwner, updateTimetable);

module.exports = router;
