const Feedback = require('../models/Feedback');
const Mentorship = require('../models/Mentorship');
const Meeting = require('../models/Meeting');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('./notificationController');

// @desc Get feedback related to current user
// @route GET /api/feedback?type=
exports.getFeedback = asyncHandler(async (req, res) => {
  const filter = { type: req.query.type || undefined };
  if (!filter.type) delete filter.type;

  if (req.user.role === 'student') {
    filter.student = req.user._id;
  } else if (req.user.role === 'mentor') {
    filter.mentor = req.user._id;
  }

  const feedback = await Feedback.find(filter)
    .populate('mentor', 'name profilePhoto')
    .populate('student', 'name profilePhoto rollNumber')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: feedback.length, feedback });
});

// @desc Mentor gives feedback on student
// @route POST /api/feedback/mentor
exports.mentorFeedback = asyncHandler(async (req, res) => {
  if (req.user.role !== 'mentor') throw new ErrorResponse('Only mentors can create this feedback', 403);
  const { student, meeting, technicalSkills, communication, consistency, problemSolving, overallRating, feedback } = req.body;

  const mentorship = await Mentorship.findOne({ mentor: req.user._id, student, status: 'active' });
  if (!mentorship) throw new ErrorResponse('Student is not assigned to you', 400);

  const fb = await Feedback.create({
    student, mentor: req.user._id, meeting: meeting || null,
    type: 'mentor-to-student',
    technicalSkills, communication, consistency, problemSolving, overallRating, feedback,
  });

  await createNotification({ user: student, type: 'new_feedback', title: 'New feedback from mentor', message: `${req.user.name} shared feedback with you`, link: '/dashboard/feedback' });

  res.status(201).json({ success: true, feedback: fb });
});

// @desc Student rates mentorship experience
// @route POST /api/feedback/student
exports.studentFeedback = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') throw new ErrorResponse('Only students can create this feedback', 403);
  const mentorship = await Mentorship.findOne({ student: req.user._id, status: 'active' }).populate('mentor');
  if (!mentorship?.mentor) throw new ErrorResponse('No mentor assigned', 400);

  const { overallRating, communication, guidance, availability, comment } = req.body;

  const fb = await Feedback.create({
    student: req.user._id,
    mentor: mentorship.mentor._id,
    type: 'student-to-mentor',
    overallRating,
    communication,
    guidance,
    availability,
    comment,
  });

  res.status(201).json({ success: true, feedback: fb });
});