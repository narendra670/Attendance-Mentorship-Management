const Goal = require('../models/Goal');
const Mentorship = require('../models/Mentorship');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('./notificationController');

// @desc List goals (own for student, created by mentor)
// @route GET /api/goals?student=
exports.getGoals = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    filter.student = req.user._id;
  } else if (req.user.role === 'mentor') {
    filter.mentor = req.user._id;
    if (req.query.student) filter.student = req.query.student;
  }

  const goals = await Goal.find(filter)
    .populate('mentor', 'name profilePhoto')
    .populate('student', 'name profilePhoto rollNumber')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: goals.length, goals });
});

// @desc Get single goal
// @route GET /api/goals/:id
exports.getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id).populate('mentor', 'name').populate('student', 'name rollNumber');
  if (!goal) throw new ErrorResponse('Goal not found', 404);
  res.status(200).json({ success: true, goal });
});

// @desc Mentor creates goal for student
// @route POST /api/goals
exports.createGoal = asyncHandler(async (req, res) => {
  if (req.user.role !== 'mentor') throw new ErrorResponse('Only mentors can assign goals', 403);
  const { student, title, description, category, priority, deadline, milestones } = req.body;

  const mentorship = await Mentorship.findOne({ mentor: req.user._id, student, status: 'active' });
  if (!mentorship) throw new ErrorResponse('Student is not assigned to you', 400);

  const goal = await Goal.create({ student, mentor: req.user._id, title, description, category, priority, deadline, status: 'Not Started', milestones: milestones || [] });

  await createNotification({ user: student, type: 'goal_assigned', title: 'New goal assigned', message: `${req.user.name} assigned a new goal: ${title}`, link: '/dashboard/goals' });

  res.status(201).json({ success: true, goal });
});

// @desc Update goal (mentor) / progress (student & mentor)
// @route PUT /api/goals/:id
exports.updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) throw new ErrorResponse('Goal not found', 404);

  const isMentor = String(goal.mentor) === String(req.user._id);
  const isStudent = String(goal.student) === String(req.user._id);

  if (req.user.role === 'mentor' && isMentor) {
    ['title', 'description', 'category', 'priority', 'deadline', 'milestones'].forEach((f) => {
      if (req.body[f] !== undefined) goal[f] = req.body[f];
    });
    if (req.body.progress !== undefined) goal.progress = req.body.progress;
    if (req.body.status !== undefined) goal.status = req.body.status;
  } else if (req.user.role === 'student' && isStudent) {
    if (req.body.progress !== undefined) goal.progress = Math.min(100, Math.max(0, req.body.progress));
    if (req.body.status !== undefined && ['Not Started', 'In Progress', 'Completed'].includes(req.body.status)) {
      goal.status = req.body.status;
    }
  } else {
    throw new ErrorResponse('Not authorized for this goal', 403);
  }

  if (goal.status === 'Completed' && !goal.completedAt) {
    goal.completedAt = new Date();
    goal.progress = 100;
    await createNotification({ user: goal.mentor, type: 'goal_completed', title: 'Goal completed', message: `${req.user.name} completed the goal: ${goal.title}`, link: '/dashboard/goals' });
  }

  await goal.save();
  res.status(200).json({ success: true, goal });
});

// @desc Delete goal (mentor)
// @route DELETE /api/goals/:id
exports.deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) throw new ErrorResponse('Goal not found', 404);
  if (String(goal.mentor) !== String(req.user._id)) throw new ErrorResponse('Not authorized', 403);
  await goal.deleteOne();
  res.status(200).json({ success: true, message: 'Goal deleted' });
});