// backend/routes/groupRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/authMiddleware"); // JWT verify
const requireRole = require("../middleware/requireRole"); // role check
const Group = require("../models/Group");
const isGroupOwner = require("../middleware/isGroupOwner");
const { updateTimetable } = require("../controllers/timetableController");

const router = express.Router();

/**
 * Create Group (only admin)
 * Request body: { name, description, password, isPrivate }
 * Owner will automatically be member
 */
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, password, isPrivate = true } = req.body;

    // Validate input
    if (!name || !password) {
      return res
        .status(400)
        .json({ message: "Name and password are required" });
    }

    // Debug: check req.user
    if (!req.user || !req.user.id) {
      console.error("JWT decode failed, req.user:", req.user);
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    // Check if group already exists for this owner
    const existing = await Group.findOne({ name, owner: req.user.id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already created a group with that name" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create group
    const group = new Group({
      name,
      description,
      owner: req.user.id,
      passwordHash,
      isPrivate,
      members: [req.user.id],
    });

    await group.save();

    console.log("Group created:", group); // debug
    res.status(201).json(group);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Server error while creating group" });
  }
});

/**
 * Get groups available to join (not yet member)
 */
router.get("/available", auth, async (req, res) => {
  try {
    // Find groups where current user is NOT a member
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
 * Join Group by password (any role)
 * body: { groupId, password }
 */
router.post("/join", auth, async (req, res) => {
  try {
    const { groupId, password } = req.body;
    if (!groupId || !password)
      return res
        .status(400)
        .json({ message: "Group ID and password are required" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.id))
      return res.status(200).json({ message: "Already a member", group });

    const match = await bcrypt.compare(password, group.passwordHash);
    if (!match) return res.status(403).json({ message: "Invalid password" });

    group.members.push(req.user.id);
    await group.save();

    res.json({ message: "Joined group successfully", group });
  } catch (err) {
    console.error("Error joining group:", err);
    res.status(500).json({ message: "Server error while joining group" });
  }
});

/**
 * Get groups owned by me (admin only)
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
 * Get groups I'm member of (any role)
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
 * Get single group by ID — only owner can access
 */
router.get("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("owner", "name email role")
      .populate("members", "name email role");
    // .populate("subjects")   // if subjects schema exists
    // .populate("teachers");  // if teachers schema exists

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only owner admin can access
    if (group.owner._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this group" });
    }

    res.json(group);
  } catch (err) {
    console.error("Error fetching group by ID:", err);
    res.status(500).json({ message: "Server error while fetching group" });
  }
});

router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "Only owner can update this group" });

    const { name, description, password } = req.body;

    if (name) group.name = name;
    if (description) group.description = description;
    if (password) {
      const bcrypt = require("bcryptjs");
      group.passwordHash = await bcrypt.hash(password, 10);
    }

    await group.save();
    res.json({ message: "Group updated successfully", group });
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Delete group — only owner (admin) can delete
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only owner can delete
    if (group.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "Only owner can delete this group" });

    await group.deleteOne(); // ← updated
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "Server error while deleting group" });
  }
});

// Get group details for any member (teacher included)
router.get("/:id/view", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if current user is member
    if (!group.members.some((m) => m._id.toString() === req.user.id)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Teacher/admin can see subjects, timetable & constraints
    res.json({
      name: group.name,
      owner: group.owner,
      subjects: group.subjects,
      teachers: group.teachers,
      timetable: group.timetable,
      constraints: group.constraints,
    });
  } catch (err) {
    console.error("Error fetching group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/timetable", auth, requireRole("admin"), isGroupOwner, updateTimetable);

module.exports = router;
