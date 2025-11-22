// backend/models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null } // optional: resource belongs to a group
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);