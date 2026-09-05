const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const createNotification = async ({ user, type = 'info', title, message = '', link = '' }) => {
  try {
    await Notification.create({ user, type, title, message, link });
  } catch (err) {
    console.error('Notification create failed:', err.message);
  }
};

// @desc Get current user's notifications
// @route GET /api/notifications
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(60);
  const unread = notifications.filter((n) => !n.read).length;
  res.status(200).json({ success: true, unread, notifications });
});

// @desc Mark a notification read
// @route PUT /api/notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );
  res.status(200).json({ success: true, notification });
});

// @desc Mark all read
// @route PUT /api/notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// @desc Delete a notification
// @route DELETE /api/notifications/:id
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.status(200).json({ success: true, message: 'Notification deleted' });
});

exports.createNotification = createNotification;