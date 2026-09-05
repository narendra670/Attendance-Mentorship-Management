const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'mentor_assigned',
        'meeting_request',
        'meeting_accepted',
        'meeting_rejected',
        'meeting_rescheduled',
        'meeting_cancelled',
        'meeting_completed',
        'upcoming_meeting',
        'new_task',
        'task_deadline',
        'goal_assigned',
        'goal_completed',
        'new_feedback',
        'new_message',
        'new_announcement',
        'info',
      ],
      default: 'info',
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);