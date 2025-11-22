// backend/models/Teacher.js
const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // 🚀 FIXED: Subjects changed back to Array of Strings 
  // (to match Group.js embedded schema and controller usage)
  subjects: [{ type: String }],
  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Teacher", teacherSchema);