const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, logout, getMe, updateProfile,
  forgotPassword, resetPassword, changePassword, getDepartments,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);
router.get('/departments', getDepartments);

module.exports = router;