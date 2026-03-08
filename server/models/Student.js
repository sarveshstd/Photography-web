const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  registerNumber: { type: String, unique: true, required: true },
  votedPhoto: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
  votedVideo: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
  isBlocked: { type: Boolean, default: false }, // Blocked voters cannot vote again
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
