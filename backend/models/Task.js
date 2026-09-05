const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    deadline: { type: Date },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Submitted', 'Completed', 'Overdue'],
      default: 'Pending',
    },
    submission: {
      link: { type: String, default: '' },
      document: { type: String, default: '' },
      note: { type: String, default: '' },
      submittedAt: { type: Date },
    },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);