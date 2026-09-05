const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const mentor = require('../controllers/mentorController');

router.use(protect, authorize('mentor'));

router.get('/students', mentor.getStudents);
router.get('/students/:id', mentor.getStudentDetail);
router.get('/resources', mentor.resources);
router.get('/unassigned-students', mentor.getUnassignedStudents);

module.exports = router;