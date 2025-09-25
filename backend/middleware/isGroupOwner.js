const Group = require("../models/Group");

const isGroupOwner = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized. Only group owner can do this." });
    }

    req.group = group;
    next();
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = isGroupOwner;
