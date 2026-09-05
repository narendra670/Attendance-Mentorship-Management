const Resource = require('../models/Resource');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc List resources
// @route GET /api/resources?category=&type=&search=
exports.getResources = asyncHandler(async (req, res) => {
  const { category, type, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }];

  const resources = await Resource.find(filter).populate('mentor', 'name profilePhoto').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: resources.length, resources });
});

// @desc Mentor creates resource
// @route POST /api/resources
exports.createResource = asyncHandler(async (req, res) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') throw new ErrorResponse('Only mentors and admins can share resources', 403);
  const { title, description, type, url, category } = req.body;
  const resource = await Resource.create({ mentor: req.user._id, title, description, type, url, category });
  res.status(201).json({ success: true, resource });
});

// @desc Update resource (owner)
// @route PUT /api/resources/:id
exports.updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ErrorResponse('Resource not found', 404);
  if (String(resource.mentor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ErrorResponse('Not authorized', 403);
  }
  ['title', 'description', 'type', 'url', 'category'].forEach((f) => {
    if (req.body[f] !== undefined) resource[f] = req.body[f];
  });
  await resource.save();
  res.status(200).json({ success: true, resource });
});

// @desc Delete resource (owner)
// @route DELETE /api/resources/:id
exports.deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ErrorResponse('Resource not found', 404);
  if (String(resource.mentor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ErrorResponse('Not authorized', 403);
  }
  await resource.deleteOne();
  res.status(200).json({ success: true, message: 'Resource deleted' });
});