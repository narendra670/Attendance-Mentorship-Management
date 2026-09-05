const User = require('../models/User');
const Department = require('../models/Department');
const Mentorship = require('../models/Mentorship');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('./notificationController');

const sanitize = (user) => {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  delete u.resetPasswordToken;
  delete u.resetPasswordExpire;
  return u;
};

// ---------------- Users ----------------

// @desc List users filtered by role/department/search
// @route GET /api/admin/users?role=&department=&search=
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, department, search, semester } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (semester) filter.semester = semester;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
  res.status(200).json({ success: true, count: users.length, users: users.map(sanitize) });
});

// @desc Get single user with relationships
// @route GET /api/admin/users/:id
exports.getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ErrorResponse('User not found', 404);

  let assignments = [];
  if (user.role === 'student') {
    assignments = await Mentorship.find({ student: user._id }).populate('mentor', 'name email profilePhoto');
  } else if (user.role === 'mentor') {
    assignments = await Mentorship.find({ mentor: user._id }).populate('student', 'name email rollNumber department semester');
  }

  res.status(200).json({ success: true, user: sanitize(user), assignments });
});

// @desc Create user (admin) - including mentors & students
// @route POST /api/admin/users
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password = 'password123', role, ...rest } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ErrorResponse('Email already exists', 400);

  const user = await User.create({ name, email, password, role, ...rest });
  res.status(201).json({ success: true, user: sanitize(user) });
});

// @desc Update user (admin)
// @route PUT /api/admin/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ErrorResponse('User not found', 404);
  const allowed = [
    'name', 'email', 'role', 'profilePhoto', 'phone', 'isActive',
    'rollNumber', 'course', 'department', 'semester', 'careerGoal',
    'designation', 'specialization', 'experience',
  ];
  allowed.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
  await user.save();
  res.status(200).json({ success: true, user: sanitize(user) });
});

// @desc Delete user (admin)
// @route DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ErrorResponse('User not found', 404);
  if (user._id.toString() === req.user._id.toString()) throw new ErrorResponse('Cannot delete your own account', 400);
  await Mentorship.deleteMany({ $or: [{ student: user._id }, { mentor: user._id }] });
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User and related records deleted' });
});

// ---------------- Departments ----------------

exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.status(200).json({ success: true, departments });
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, code, courses } = req.body;
  const dept = await Department.create({ name, code, courses: courses || [] });
  res.status(201).json({ success: true, department: dept });
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!dept) throw new ErrorResponse('Department not found', 404);
  res.status(200).json({ success: true, department: dept });
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Department deleted' });
});

// ---------------- Mentor Assignments ----------------

// @desc Assign mentor to student
// @route POST /api/admin/assignments
exports.assignMentor = asyncHandler(async (req, res) => {
  const { studentId, mentorId, department } = req.body;
  const student = await User.findById(studentId);
  const mentor = await User.findById(mentorId);
  if (!student || student.role !== 'student') throw new ErrorResponse('Student not found', 404);
  if (!mentor || mentor.role !== 'mentor') throw new ErrorResponse('Mentor not found', 404);

  await Mentorship.updateMany({ student: studentId, status: 'active' }, { status: 'ended', endedDate: new Date() });

  const assignment = await Mentorship.create({
    student: studentId,
    mentor: mentorId,
    department: department || student.department || '',
    status: 'active',
    history: [{ mentor: mentorId, action: 'assigned' }],
  });

  await createNotification({ user: studentId, type: 'mentor_assigned', title: 'Mentor assigned', message: `${mentor.name} is now your mentor.`, link: '/dashboard/mentor' });
  await createNotification({ user: mentorId, type: 'mentor_assigned', title: 'New student assigned', message: `${student.name} has been assigned to you.`, link: '/dashboard/students' });

  res.status(201).json({ success: true, assignment });
});

// @desc Change mentor (reassign)
// @route PUT /api/admin/assignments/:id
exports.changeMentor = asyncHandler(async (req, res) => {
  const { mentorId } = req.body;
  const assignment = await Mentorship.findById(req.params.id);
  if (!assignment) throw new ErrorResponse('Assignment not found', 404);

  assignment.mentor = mentorId;
  assignment.history.push({ mentor: mentorId, action: 'changed' });
  await assignment.save();

  const mentor = await User.findById(mentorId);
  const student = await User.findById(assignment.student);
  await createNotification({ user: assignment.student, type: 'mentor_assigned', title: 'Mentor changed', message: `${mentor?.name} is now your new mentor.`, link: '/dashboard/mentor' });

  res.status(200).json({ success: true, assignment });
});

// @desc Remove mentor (end assignment)
// @route PUT /api/admin/assignments/:id/remove
exports.removeMentor = asyncHandler(async (req, res) => {
  const assignment = await Mentorship.findById(req.params.id);
  if (!assignment) throw new ErrorResponse('Assignment not found', 404);
  assignment.status = 'ended';
  assignment.endedDate = new Date();
  assignment.history.push({ mentor: assignment.mentor, action: 'removed' });
  await assignment.save();

  await createNotification({ user: assignment.student, type: 'info', title: 'Mentor assignment ended', message: 'Your mentor assignment has been ended.', link: '/dashboard' });

  res.status(200).json({ success: true, assignment });
});

// @desc List assignments
// @route GET /api/admin/assignments?status=&department=&search=
exports.getAssignments = asyncHandler(async (req, res) => {
  const { status, department, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;

  const populated = await Mentorship.find(filter)
    .populate('student', 'name email rollNumber department semester profilePhoto')
    .populate('mentor', 'name email profilePhoto designation')
    .sort({ createdAt: -1 });

  let assignments = populated;
  if (search) {
    const s = search.toLowerCase();
    assignments = populated.filter(
      (a) =>
        a.student?.name?.toLowerCase().includes(s) ||
        a.student?.rollNumber?.toLowerCase().includes(s) ||
        a.mentor?.name?.toLowerCase().includes(s)
    );
  }

  res.status(200).json({ success: true, count: assignments.length, assignments });
});

// @desc Mentor workload
// @route GET /api/admin/mentor-workload
exports.getMentorWorkload = asyncHandler(async (req, res) => {
  const mentors = await User.find({ role: 'mentor', isActive: true }).select('name email profilePhoto designation');
  const workloads = await Mentorship.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$mentor', count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(workloads.map((w) => [String(w._id), w.count]));
  const result = mentors.map((m) => ({ ...sanitize(m), assignedStudents: map[String(m._id)] || 0 }));
  result.sort((a, b) => b.assignedStudents - a.assignedStudents);
  res.status(200).json({ success: true, workloads: result });
});

// @desc Stats for admin manage page
// @route GET /api/admin/stats
exports.getAdminStats = asyncHandler(async (req, res) => {
  const [students, mentors, activeMentorships] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'mentor' }),
    Mentorship.countDocuments({ status: 'active' }),
  ]);
  res.status(200).json({ success: true, stats: { students, mentors, activeMentorships } });
});