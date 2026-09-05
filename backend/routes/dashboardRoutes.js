const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboard, getStudentProgress, getAnalytics } = require('../controllers/dashboardController');

router.use(protect);
router.get('/', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/progress/:studentId', getStudentProgress);

module.exports = router;