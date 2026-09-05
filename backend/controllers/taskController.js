const Task = require('../models/Task');
const Mentorship = require('../models/Mentorship');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('./notificationController');

// @desc List tasks
// @route GET /api/tasks?student=&status=
exports.getTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.user._id;
  else if (req.user.role === 'mentor') {
    filter.mentor = req.user._id;
    if (req.query.student) filter.student = req.query.student;
  }
  if (req.query.status) filter.status = req.query.status;

  const tasks = await Task.find(filter)
    .populate('mentor', 'name profilePhoto')
    .populate('student', 'name profilePhoto rollNumber')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: tasks.length, tasks });
});

// @desc Mentor creates task
// @route POST /api/tasks
exports.createTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'mentor') throw new ErrorResponse('Only mentors can assign tasks', 403);
  const { student, title, description, deadline, priority } = req.body;

  const mentorship = await Mentorship.findOne({ mentor: req.user._id, student, status: 'active' });
  if (!mentorship) throw new ErrorResponse('Student is not assigned to you', 400);

  const task = await Task.create({ student, mentor: req.user._id, title, description, deadline, priority });

  await createNotification({ user: student, type: 'new_task', title: 'New task assigned', message: `${req.user.name} assigned a new task: ${title}`, link: '/dashboard/tasks' });

  res.status(201).json({ success: true, task });
});

// @desc Update task (mentor edit; student submits)
// @route PUT /api/tasks/:id
exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ErrorResponse('Task not found', 404);

  const isMentor = String(task.mentor) === String(req.user._id);
  const isStudent = String(task.student) === String(req.user._id);

  if (req.user.role === 'mentor' && isMentor) {
    ['title', 'description', 'deadline', 'priority'].forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.feedback !== undefined) {
      task.feedback = req.body.feedback;
      await createNotification({ user: task.student, type: 'new_feedback', title: 'Feedback on task', message: `You received feedback on "${task.title}"`, link: '/dashboard/tasks' });
    }
  } else if (req.user.role === 'student' && isStudent) {
    if (req.body.status !== undefined && ['Pending', 'In Progress', 'Submitted'].includes(req.body.status)) {
      task.status = req.body.status;
      if (task.status === 'Submitted') {
        task.submission = {
          link: req.body.submission?.link || task.submission?.link || '',
          note: req.body.submission?.note || task.submission?.note || '',
          submittedAt: new Date(),
        };
        await createNotification({ user: task.mentor, type: 'info', title: 'Task submitted', message: `${req.user.name} submitted "${task.title}"`, link: '/dashboard/tasks' });
      }
    }
  } else {
    throw new ErrorResponse('Not authorized for this task', 403);
  }

  if (task.deadline && task.deadline < new Date() && !['Completed', 'Submitted'].includes(task.status)) {
    task.status = 'Overdue';
  }

  await task.save();
  res.status(200).json({ success: true, task });
});

// @desc Delete task (mentor)
// @route DELETE /api/tasks/:id
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ErrorResponse('Task not found', 404);
  if (String(task.mentor) !== String(req.user._id)) throw new ErrorResponse('Not authorized', 403);
  await task.deleteOne();
  res.status(200).json({ success: true, message: 'Task deleted' });
});