const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['photo', 'video'], required: true },
  url: { type: String, required: true },
  votes: { type: Number, default: 0 },
  voters: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Media', MediaSchema);
