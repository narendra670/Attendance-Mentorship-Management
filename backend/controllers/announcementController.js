const Announcement = require('../models/Announcement');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('./notificationController');

// @desc Get announcements visible to current user
// @route GET /api/announcements
exports.getAnnouncements = asyncHandler(async (req, res) => {
  const user = req.user;
  const all = await Announcement.find().populate('admin', 'name').sort({ createdAt: -1 }).limit(100);

  const visible = all.filter((a) => {
    const t = a.target;
    if (t.type === 'all' || t.type === undefined) return true;
    if (user.role === 'admin') return true;
    if (t.type === 'department') return user.department === t.department;
    if (t.type === 'course') return user.course === t.course;
    if (t.type === 'semester') return user.semester === t.semester;
    if (t.type === 'mentor_group') return String(t.mentor || '') === String(user._id);
    return false;
  });

  res.status(200).json({ success: true, count: visible.length, announcements: visible });
});

// @desc Admin creates announcement
// @route POST /api/announcements
exports.createAnnouncement = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') throw new ErrorResponse('Only admins can create announcements', 403);
  const { title, message, target, eventDate } = req.body;

  const announcement = await Announcement.create({
    admin: req.user._id,
    title, message,
    target: {
      type: target?.type || 'all',
      department: target?.department || '',
      course: target?.course || '',
      semester: target?.semester || '',
      mentor: target?.mentor || undefined,
    },
    eventDate,
  });

  // Notify target students
  const notify = async (filter) => {
    const students = await User.find({ role: 'student', ...filter }).select('_id');
    for (const s of students) {
      await createNotification({ user: s._id, type: 'new_announcement', title, message: announcement.message.slice(0, 120), link: '/dashboard' });
    }
  };
  const t = announcement.target;
  if (t.type === 'all') await notify({});
  else if (t.type === 'department') await notify({ department: t.department });
  else if (t.type === 'course') await notify({ course: t.course });
  else if (t.type === 'semester') await notify({ semester: t.semester });

  res.status(201).json({ success: true, announcement });
});

// @desc Update announcement
// @route PUT /api/announcements/:id
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') throw new ErrorResponse('Only admins can update announcements', 403);
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ErrorResponse('Announcement not found', 404);
  if (req.body.title) announcement.title = req.body.title;
  if (req.body.message) announcement.message = req.body.message;
  if (req.body.eventDate) announcement.eventDate = req.body.eventDate;
  await announcement.save();
  res.status(200).json({ success: true, announcement });
});

// @desc Delete announcement
// @route DELETE /api/announcements/:id
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') throw new ErrorResponse('Only admins can delete announcements', 403);
  await Announcement.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Announcement deleted' });
});