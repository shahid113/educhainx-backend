const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateNo: { type: String, required: true, unique: true },
  dateofIssue: { type: Date, required: true },
  name: { type: String, required: true },
  enrolmentNo: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  degree: { type: String, required: true },
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  transactionHash: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Certificate', certificateSchema);