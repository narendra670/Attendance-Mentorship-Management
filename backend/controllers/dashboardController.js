const mongoose = require('mongoose');
const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const Meeting = require('../models/Meeting');
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const { computeStudentProgress } = require('./progressHelper');
const { startOfToday, addDays } = require('../utils/date');

// @desc Get dashboard data based on role
// @route GET /api/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  let data = {};

  if (user.role === 'student') {
    const mentorship = await Mentorship.findOne({ student: user._id, status: 'active' }).populate('mentor', 'name email profilePhoto designation specialization');
    const mentor = mentorship?.mentor || null;

    const [meetings, upcomingMeeting, activeGoals, completedGoals, pendingTasks, totalGoals, totalTasks, unreadMessages, unreadNotifs, recentMeetings] =
      await Promise.all([
        Meeting.countDocuments({ student: user._id }),
        Meeting.findOne({ student: user._id, status: 'accepted', date: { $gte: startOfToday() } }).sort({ date: 1 }),
        Goal.countDocuments({ student: user._id, status: { $in: ['In Progress', 'Not Started'] } }),
        Goal.countDocuments({ student: user._id, status: 'Completed' }),
        Task.countDocuments({ student: user._id, status: { $in: ['Pending', 'In Progress'] } }),
        Goal.countDocuments({ student: user._id }),
        Task.countDocuments({ student: user._id }),
        require('../models/Message').countDocuments({ receiver: user._id, read: false }),
        require('../models/Notification').countDocuments({ user: user._id, read: false }),
        meetingData(user._id, mentor?._id),
      ]);

    const overallProgress = await computeStudentProgress(user._id, mentor?._id);

    data = {
      role: 'student',
      mentor,
      stats: {
        assignedMentor: mentor ? true : false,
        upcomingMeetings: upcomingMeeting ? 1 : 0,
        meetings: meetings,
        activeGoals,
        completedGoals,
        pendingTasks,
        unreadMessages,
        unreadNotifications: unreadNotifs,
      },
      upcomingMeeting,
      overallProgress,
      recentMeetings,
      welcome: `Welcome back, ${user.name.split(' ')[0]}!`,
    };
  }

  if (user.role === 'mentor') {
    const mentorships = await Mentorship.find({ mentor: user._id, status: 'active' }).select('student');
    const studentIds = mentorships.map((m) => m.student);
    const studentCount = studentIds.length;

    const [pendingRequests, upcomingMeetings, activeGoals, completedGoals, pendingTasks, unreadMessages, unreadNotifs, recentCompleted] =
      await Promise.all([
        Meeting.countDocuments({ mentor: user._id, status: 'pending' }),
        Meeting.find({ mentor: user._id, status: 'accepted', date: { $gte: startOfToday() } })
          .populate('student', 'name profilePhoto department').sort({ date: 1 }).limit(5),
        Goal.countDocuments({ mentor: user._id, status: { $in: ['In Progress', 'Not Started'] } }),
        Goal.countDocuments({ mentor: user._id, status: 'Completed' }),
        Task.countDocuments({ mentor: user._id, status: { $in: ['Pending', 'In Progress'] } }),
        require('../models/Message').countDocuments({ receiver: user._id, read: false }),
        require('../models/Notification').countDocuments({ user: user._id, read: false }),
        Meeting.countDocuments({ mentor: user._id, status: 'completed' }),
      ]);

    data = {
      role: 'mentor',
      stats: {
        assignedStudents: studentCount,
        pendingRequests,
        upcomingMeetings: upcomingMeetings.length,
        activeGoals,
        completedGoals,
        completedMeetings: recentCompleted,
        pendingTasks,
        unreadMessages,
        unreadNotifications: unreadNotifs,
      },
      upcomingMeetings,
      welcome: `Welcome back, ${user.name.split(' ')[0]}!`,
    };
  }

  if (user.role === 'admin') {
    const [students, mentors, departments, activeMentorships, upcomingMeetings, completedMeetings, pendingRequests, goals, tasks] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'mentor' }),
        Department.countDocuments(),
        Mentorship.countDocuments({ status: 'active' }),
        Meeting.countDocuments({ status: 'accepted', date: { $gte: startOfToday() } }),
        Meeting.countDocuments({ status: 'completed' }),
        Meeting.countDocuments({ status: 'pending' }),
        Goal.countDocuments(),
        Task.countDocuments(),
      ]);

    const goalCompletionRate = goals ? Math.round((await Goal.countDocuments({ status: 'Completed' }) / goals) * 100) : 0;
    const taskCompletionRate = tasks ? Math.round((await Task.countDocuments({ status: 'Completed' }) / tasks) * 100) : 0;

    const deptWise = await User.aggregate([
      { $match: { role: 'student', department: { $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const semesterWise = await User.aggregate([
      { $match: { role: 'student', semester: { $ne: '' } } },
      { $group: { _id: '$semester', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const meetingsPerMonth = await Meeting.aggregate([
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    data = {
      role: 'admin',
      stats: {
        totalStudents: students,
        totalMentors: mentors,
        totalDepartments: departments,
        activeMentorships,
        upcomingMeetings,
        completedMeetings,
        pendingRequests,
        goalCompletionRate,
        taskCompletionRate,
      },
      charts: { deptWise, semesterWise, meetingsPerMonth },
      welcome: `Welcome back, ${user.name.split(' ')[0]}!`,
    };
  }

  res.status(200).json({ success: true, data });
});

const meetingData = async (studentId, mentorId) => {
  if (!mentorId) return null;
  return Meeting.find({ student: studentId, status: 'completed' })
    .populate('mentor', 'name').sort({ completedAt: -1 }).limit(3).lean();
};

const aggGoalsByStatus = (filter = {}) =>
  Goal.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);

const aggGoalsByCategory = (filter = {}) =>
  Goal.aggregate([{ $match: filter }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);

const aggTasksByStatus = (filter = {}) =>
  Task.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);

const aggMeetingsByMonth = (filter = {}) =>
  Meeting.aggregate([{ $match: filter }, { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);

// @desc Role-specific analytics (removed from dashboard to keep pages fast)
// @route GET /api/dashboard/analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === 'student') {
    const [goals, goalCategories, tasks, meetings] = await Promise.all([
      aggGoalsByStatus({ student: user._id }),
      aggGoalsByCategory({ student: user._id }),
      aggTasksByStatus({ student: user._id }),
      aggMeetingsByMonth({ student: user._id }),
    ]);
    const progress = await computeStudentProgress(user._id);
    return res.status(200).json({ success: true, data: { progress, goals, goalCategories, tasks, meetings } });
  }

  if (user.role === 'mentor') {
    const mentorships = await Mentorship.find({ mentor: user._id, status: 'active' }).select('student');
    const ids = mentorships.map((m) => m.student);

    const [goals, goalCategories, tasks, meetings, studentProgress] = await Promise.all([
      aggGoalsByStatus({ mentor: user._id }),
      aggGoalsByCategory({ mentor: user._id }),
      aggTasksByStatus({ mentor: user._id }),
      aggMeetingsByMonth({ mentor: user._id }),
      ids.length
        ? Promise.all(ids.map(async (id) => {
            const [overall, student] = await Promise.all([
              computeStudentProgress(id),
              User.findById(id).select('name rollNumber profilePhoto department'),
            ]);
            return { student, ...overall };
          }))
        : Promise.resolve([]),
    ]);
    return res.status(200).json({ success: true, data: { goals, goalCategories, tasks, meetings, studentProgress } });
  }

  // Admin
  const [goals, goalCategories, tasks, meetings] = await Promise.all([
    aggGoalsByStatus({}),
    aggGoalsByCategory({}),
    aggTasksByStatus({}),
    aggMeetingsByMonth({}),
  ]);
  return res.status(200).json({ success: true, data: { goals, goalCategories, tasks, meetings } });
});

// @desc Mentor progress for one of their students
// @route GET /api/progress/:studentId
exports.getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  if (!mongoose.isValidObjectId(studentId)) throw require('../utils/errorResponse')('Invalid student id', 400);

  const isAuthorized =
    req.user.role === 'admin' ||
    (req.user.role === 'mentor' && (await Mentorship.exists({ mentor: req.user._id, student: studentId, status: 'active' }))) ||
    (req.user.role === 'student' && req.user._id.toString() === studentId.toString());
  if (!isAuthorized) throw require('../utils/errorResponse')('Not authorized', 403);

  const mentorship = await Mentorship.findOne({ student: studentId, status: 'active' });
  const progress = await computeStudentProgress(studentId, mentorship?.mentor);

  const [goals, tasks, meetings, feedback] = await Promise.all([
    Goal.find({ student: studentId }).populate('mentor', 'name').sort({ createdAt: -1 }),
    Task.find({ student: studentId }).populate('mentor', 'name').sort({ createdAt: -1 }),
    Meeting.find({ student: studentId }).populate('mentor', 'name').sort({ createdAt: -1 }),
    require('../models/Feedback').find({ student: studentId, type: 'mentor-to-student' }).populate('mentor', 'name').sort({ createdAt: -1 }).limit(5),
  ]);

  res.status(200).json({
    success: true,
    progress,
    goals,
    tasks,
    meetings,
    feedback,
  });
});