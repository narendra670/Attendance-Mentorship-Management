const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
    type: { type: String, enum: ['mentor-to-student', 'student-to-mentor'], required: true },
    overallRating: { type: Number, min: 0, max: 10, default: 0 },
    technicalSkills: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    consistency: { type: Number, min: 0, max: 10, default: 0 },
    problemSolving: { type: Number, min: 0, max: 10, default: 0 },
    guidance: { type: Number, min: 0, max: 10, default: 0 },
    availability: { type: Number, min: 0, max: 10, default: 0 },
    feedback: { type: String, default: '' },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);