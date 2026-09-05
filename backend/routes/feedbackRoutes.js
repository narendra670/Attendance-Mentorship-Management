const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const feedback = require('../controllers/feedbackController');

router.use(protect);

router.get('/', feedback.getFeedback);
router.post('/mentor', feedback.mentorFeedback);
router.post('/student', feedback.studentFeedback);

module.exports = router;