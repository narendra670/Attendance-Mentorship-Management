const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    target: {
      type: { type: String, enum: ['all', 'department', 'course', 'semester', 'mentor_group'], default: 'all' },
      department: { type: String, default: '' },
      course: { type: String, default: '' },
      semester: { type: String, default: '' },
      mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    eventDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);