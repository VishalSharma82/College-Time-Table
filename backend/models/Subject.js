// backend/models/Subject.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true, unique: true },
  isLab: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Subject", subjectSchema);