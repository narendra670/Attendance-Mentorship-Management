const Message = require('../models/Message');
const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('./notificationController');

// @desc Get messages with a specific user
// @route GET /api/messages/:userId
exports.getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await assertCanChat(req.user, userId);

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 }).limit(200);

  await Message.updateMany({ sender: userId, receiver: req.user._id, read: false }, { read: true, readAt: new Date() });

  const peer = await User.findById(userId).select('name profilePhoto status role department');
  res.status(200).json({ success: true, peer, messages });
});

// @desc Get conversation list
// @route GET /api/messages
exports.getConversations = asyncHandler(async (req, res) => {
  const convos = await Message.aggregate([
    { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', req.user._id] },
            '$receiver',
            '$sender',
          ],
        },
        lastMessage: { $first: '$content' },
        lastAt: { $first: '$createdAt' },
        unread: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$read', false] }, { $eq: ['$receiver', req.user._id] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { lastAt: -1 } },
  ]);

  const ids = convos.map((c) => c._id);
  const peers = await User.find({ _id: { $in: ids } }).select('name profilePhoto status role department rollNumber');
  const peerMap = Object.fromEntries(peers.map((p) => [String(p._id), p]));

  const result = convos
    .filter((c) => peerMap[c._id])
    .map((c) => ({ peer: peerMap[c._id], lastMessage: c.lastMessage, lastAt: c.lastAt, unread: c.unread }));

  res.status(200).json({ success: true, conversations: result });
});

// @desc Send a message
// @route POST /api/messages
exports.sendMessage = asyncHandler(async (req, res) => {
  const { receiver, content } = req.body;
  if (!content || !content.trim()) throw new ErrorResponse('Message content is required', 400);
  await assertCanChat(req.user, receiver);

  const message = await Message.create({ sender: req.user._id, receiver, content: content.trim() });

  await createNotification({ user: receiver, type: 'new_message', title: 'New message', message: `${req.user.name}: ${content.slice(0, 80)}`, link: '/dashboard/messages' });

  const populated = await Message.findById(message._id).populate('sender', 'name profilePhoto').populate('receiver', 'name profilePhoto');
  res.status(201).json({ success: true, message: populated });
});

// @desc Mark conversation read
// @route PUT /api/messages/:userId/read
exports.markRead = asyncHandler(async (req, res) => {
  await Message.updateMany({ sender: req.params.userId, receiver: req.user._id, read: false }, { read: true, readAt: new Date() });
  res.status(200).json({ success: true });
});

const assertCanChat = async (user, peerId) => {
  if (!require('mongoose').isValidObjectId(peerId)) throw new ErrorResponse('Invalid peer id', 400);
  if (String(user._id) === String(peerId)) throw new ErrorResponse('Cannot message yourself', 400);

  if (user.role === 'student') {
    const m = await Mentorship.findOne({ student: user._id, mentor: peerId, status: 'active' });
    if (!m) {
      const m2 = await Mentorship.exists({ student: user._id, status: 'active' }).then((x) => x);
      const mentorId = (await Mentorship.findOne({ student: user._id, status: 'active' }))?.mentor;
      if (String(mentorId || '') !== String(peerId)) throw new ErrorResponse('You can only chat with your assigned mentor', 403);
    }
  } else if (user.role === 'mentor') {
    const m = await Mentorship.findOne({ mentor: user._id, student: peerId, status: 'active' });
    if (!m) throw new ErrorResponse('You can only chat with your assigned students', 403);
  } else if (user.role === 'admin') {
    // admin can chat with anyone
  }
};