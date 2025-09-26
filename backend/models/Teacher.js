// backend/models/Teacher.js
const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Teacher", teacherSchema);