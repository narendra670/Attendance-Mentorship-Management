const Meeting = require('../models/Meeting');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('./notificationController');

const populate = [{ path: 'mentor', select: 'name email profilePhoto' }, { path: 'student', select: 'name email profilePhoto rollNumber department semester' }];

// @desc List meetings for current user
// @route GET /api/meetings?status=&type=
exports.getMeetings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};

  if (req.user.role === 'student') filter.student = req.user._id;
  else if (req.user.role === 'mentor') filter.mentor = req.user._id;
  else if (req.user.role === 'admin' && req.query.student) filter.student = req.query.student;

  if (status) filter.status = status;

  const meetings = await Meeting.find(filter).populate(populate).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: meetings.length, meetings });
});

// @desc Get single meeting
// @route GET /api/meetings/:id
exports.getMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id).populate(populate);
  if (!meeting) throw new ErrorResponse('Meeting not found', 404);
  assertAccess(meeting, req.user);
  res.status(200).json({ success: true, meeting });
});

// @desc Student requests a meeting
// @route POST /api/meetings
exports.createMeeting = asyncHandler(async (req, res) => {
  const { date, time, purpose, message } = req.body;
  if (req.user.role !== 'student') throw new ErrorResponse('Only students can request meetings', 403);

  const mentorship = await Mentorship.findOne({ student: req.user._id, status: 'active' }).populate('mentor');
  if (!mentorship?.mentor) throw new ErrorResponse('You do not have an assigned mentor', 400);

  const meeting = await Meeting.create({
    student: req.user._id,
    mentor: mentorship.mentor._id,
    date, time, purpose, message,
    status: 'pending',
  });

  await createNotification({
    user: mentorship.mentor._id,
    type: 'meeting_request',
    title: 'New meeting request',
    message: `${req.user.name} requested a meeting on ${new Date(date).toLocaleDateString()} at ${time}.`,
    link: '/dashboard/meetings',
  });

  res.status(201).json({ success: true, meeting });
});

// @desc Mentor/student actions on meeting
// @route PUT /api/meetings/:id
exports.updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) throw new ErrorResponse('Meeting not found', 404);
  assertAccess(meeting, req.user);

  const { action, notes, rescheduledTo, purpose } = req.body;

  if (req.user.role === 'mentor') {
    if (action === 'accept') {
      meeting.status = 'accepted';
    } else if (action === 'reject') {
      meeting.status = 'rejected';
    } else if (action === 'reschedule' && rescheduledTo) {
      meeting.status = 'rescheduled';
      meeting.rescheduledTo = rescheduledTo;
      if (rescheduledTo.date) meeting.date = rescheduledTo.date;
      if (rescheduledTo.time) meeting.time = rescheduledTo.time;
    } else if (action === 'cancel') {
      meeting.status = 'cancelled';
    } else if (action === 'complete') {
      meeting.status = 'completed';
      meeting.completedAt = new Date();
      meeting.notes = notes || meeting.notes;
    }
    meeting.notes = notes || meeting.notes;
  } else if (req.user.role === 'student') {
    if (action === 'cancel') meeting.status = 'cancelled';
    else if (action === 'purpose') meeting.purpose = purpose || meeting.purpose;
  }

  await meeting.save();

  // Notify the other party
  const otherId = req.user._id.toString() === String(meeting.student) ? meeting.mentor : meeting.student;
  const notificationMeta = {
    accept: { type: 'meeting_accepted', message: `${req.user.name} accepted your meeting request` },
    reject: { type: 'meeting_rejected', message: `${req.user.name} rejected your meeting request` },
    reschedule: { type: 'meeting_rescheduled', message: `${req.user.name} rescheduled the meeting` },
    cancel: { type: 'meeting_cancelled', message: `${req.user.name} cancelled the meeting` },
    complete: { type: 'meeting_completed', message: `${req.user.name} marked the meeting as completed` },
  };
  const meta = notificationMeta[action];
  if (meta) {
    await createNotification({
      user: otherId,
      type: meta.type,
      title: 'Meeting update',
      message: meta.message,
      link: '/dashboard/meetings',
    });
  }

  res.status(200).json({ success: true, meeting });
});

// @desc Delete/cancel meeting (student)
// @route DELETE /api/meetings/:id
exports.deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) throw new ErrorResponse('Meeting not found', 404);
  assertAccess(meeting, req.user);
  meeting.status = 'cancelled';
  await meeting.save();
  res.status(200).json({ success: true, message: 'Meeting cancelled' });
});

const assertAccess = (meeting, user) => {
  const isStudent = String(meeting.student) === String(user._id);
  const isMentor = String(meeting.mentor) === String(user._id);
  if (!isStudent && !isMentor) throw new ErrorResponse('Not authorized for this meeting', 403);
};