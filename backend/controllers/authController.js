const crypto = require('crypto');
const User = require('../models/User');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

const sanitizeUser = (user) => {
  const u = user.toObject();
  delete u.password;
  delete u.resetPasswordToken;
  delete u.resetPasswordExpire;
  return u;
};

// @desc Register user
// @route POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNumber, course, department, semester } = req.body;

  let existing = await User.findOne({ email });
  if (existing) throw new ErrorResponse('Email already registered', 400);

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    rollNumber: rollNumber || '',
    course: course || '',
    department: department || '',
    semester: semester || '',
  });

  const token = user.getSignedJwtToken();

  res.status(201).json({ success: true, token, user: sanitizeUser(user) });
});

// @desc Login
// @route POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ErrorResponse('Please provide email and password', 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ErrorResponse('Invalid credentials', 401);
  }
  if (!user.isActive) throw new ErrorResponse('Account has been deactivated. Contact admin.', 403);

  user.status = 'online';
  await user.save();

  const token = user.getSignedJwtToken();
  res.status(200).json({ success: true, token, user: sanitizeUser(user) });
});

// @desc Logout
// @route POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.status = 'offline';
    await req.user.save();
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc Get current user
// @route GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
});

// @desc Update profile
// @route PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const fields = [
    'name', 'phone', 'profilePhoto', 'bio',
    'rollNumber', 'course', 'department', 'semester',
    'academicPerformance', 'skills', 'interests', 'careerGoal',
    'designation', 'specialization', 'experience',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) req.user[f] = req.body[f];
  });
  await req.user.save();
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
});

// @desc Forgot password - issues reset token
// @route POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ErrorResponse('No user found with that email', 404);

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // In production, send this via email. For development return the URL.
  res.status(200).json({
    success: true,
    message: 'Password reset link generated',
    resetUrl,
  });
});

// @desc Reset password
// @route PUT /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) throw new ErrorResponse('Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully. Please login.' });
});

// @desc Change password (authenticated)
// @route PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    throw new ErrorResponse('Current password is incorrect', 400);
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// @desc Get auth notifications for current user
// @route GET /api/auth/notifications
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.status(200).json({ success: true, notifications });
});

// @desc Seed helper: list departments
// @route GET /api/auth/departments
exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().select('name courses');
  res.status(200).json({ success: true, departments });
});