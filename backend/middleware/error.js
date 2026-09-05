const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err.stack?.split('\n')[0], err.message);

  if (err.name === 'CastError') {
    error = new ErrorResponse(`Resource not found with id ${err.value}`, 404);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ErrorResponse(`Duplicate value entered for ${field}`, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((v) => v.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;