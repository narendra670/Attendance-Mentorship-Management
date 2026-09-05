const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, default: '' },
    assignedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    endedDate: { type: Date },
    reason: { type: String, default: '' },
    history: [
      {
        mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['assigned', 'changed', 'removed'], default: 'assigned' },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

mentorshipSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Mentorship', mentorshipSchema);