const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    purpose: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'rescheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    rescheduledTo: { date: Date, time: String },
    notes: {
      discussion: { type: String, default: '' },
      actionItems: { type: [String], default: [] },
      concerns: { type: String, default: '' },
      followUpDate: { type: Date },
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);