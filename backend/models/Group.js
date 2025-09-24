// backend/models/Group.js
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // admin who created
    passwordHash: { type: String, required: true }, // hashed password for joining
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // includes owner optionally
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
