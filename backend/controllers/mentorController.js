const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const Meeting = require('../models/Meeting');
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { computeStudentProgress } = require('./progressHelper');

const sanitize = (user) => {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  delete u.resetPasswordToken;
  delete u.resetPasswordExpire;
  return u;
};

// @desc List assigned students
// @route GET /api/mentor/students?search=&department=
exports.getStudents = asyncHandler(async (req, res) => {
  const { search, department } = req.query;
  const mentorships = await Mentorship.find({ mentor: req.user._id, status: 'active' })
    .populate('student', 'name email profilePhoto rollNumber department semester academicPerformance careerGoal status');

  let students = mentorships.map((m) => m.student);
  if (department) students = students.filter((s) => s.department === department);
  if (search) {
    const q = search.toLowerCase();
    students = students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }

  const enriched = await Promise.all(
    students.map(async (s) => {
      const progress = await computeStudentProgress(s._id, req.user._id);
      return { student: sanitize(s), progress: progress.overall };
    })
  );

  res.status(200).json({ success: true, count: enriched.length, students: enriched });
});

// @desc Get single student detail (mentor view)
// @route GET /api/mentor/students/:id
exports.getStudentDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mentorship = await Mentorship.findOne({ mentor: req.user._id, student: id, status: 'active' });
  if (!mentorship) throw new ErrorResponse('Student not assigned to you', 404);

  const student = await User.findById(id);
  if (!student) throw new ErrorResponse('Student not found', 404);

  const [goals, tasks, meetings, progress] = await Promise.all([
    Goal.find({ student: id }).sort({ createdAt: -1 }),
    Task.find({ student: id }).sort({ createdAt: -1 }),
    Meeting.find({ student: id }).sort({ createdAt: -1 }),
    computeStudentProgress(id, req.user._id),
  ]);

  res.status(200).json({ success: true, student: sanitize(student), goals, tasks, meetings, progress });
});

// @desc List unassigned students (for mentor? admin only really)
// @route GET /api/mentor/unassigned-students
exports.getUnassignedStudents = asyncHandler(async (req, res) => {
  const assigned = await Mentorship.find({ status: 'active' }).distinct('student');
  const students = await User.find({ role: 'student', _id: { $nin: assigned } })
    .select('name email rollNumber department semester').sort({ createdAt: -1 });
  res.status(200).json({ success: true, students });
});

// @desc Create / update / delete resource is in resourceController, alias here for mentor
exports.resources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ mentor: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, resources });
});