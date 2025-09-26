const Group = require("../models/Group");

const isGroupOwner = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      console.log("❌ Group not found for ID:", req.params.id);
      return res.status(404).json({ message: "Group not found" });
    }

    console.log("🔹 Checking group ownership...");
    console.log("🔹 Logged in user:", req.user);
    console.log("🔹 Group owner:", group.owner.toString());

    // ✅ Compare with req.user.id instead of req.user._id
    if (group.owner.toString() !== req.user.id) {
      console.log("❌ User is not authorized (not the group owner)");
      return res
        .status(403)
        .json({ message: "Not authorized. Only group owner can do this." });
    }

    req.group = group;
    next();
  } catch (err) {
    console.error("❌ Error in isGroupOwner middleware:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = isGroupOwner;
