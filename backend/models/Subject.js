// backend/models/Subject.js

// इस फ़ाइल को कोई अपडेट की आवश्यकता नहीं है—यह अपने आप में सही है।
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true, unique: true }, // abbreviation unique है
  isLab: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Subject", subjectSchema);