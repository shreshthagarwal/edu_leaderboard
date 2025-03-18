const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskDescription: { type: String, required: true },
  pointsRequested: { type: Number },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  customPoints: { type: Number },
}, { timestamps: true }); // Enable timestamps

module.exports = mongoose.model('Request', requestSchema);
