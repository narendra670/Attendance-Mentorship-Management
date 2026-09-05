const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['PDF', 'Document', 'Video', 'Link', 'Tutorial', 'Course', 'Notes'],
      default: 'Link',
    },
    url: { type: String, default: '' },
    file: { type: String, default: '' },
    category: { type: String, default: 'General' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);