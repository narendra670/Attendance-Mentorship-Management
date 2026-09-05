const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const meetings = require('../controllers/meetingController');

router.use(protect);

router.get('/', meetings.getMeetings);
router.post('/', meetings.createMeeting);
router.get('/:id', meetings.getMeeting);
router.put('/:id', meetings.updateMeeting);
router.delete('/:id', meetings.deleteMeeting);

module.exports = router;