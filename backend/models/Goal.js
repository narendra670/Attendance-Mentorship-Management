const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Academic', 'Technical', 'Career', 'Personal Development', 'Communication', 'Project', 'Internship'],
      default: 'Technical',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    deadline: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Overdue'],
      default: 'Not Started',
    },
    milestones: { type: [String], default: [] },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

goalSchema.pre('save', function (next) {
  if (this.deadline && this.deadline < Date.now() && this.status !== 'Completed') {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);