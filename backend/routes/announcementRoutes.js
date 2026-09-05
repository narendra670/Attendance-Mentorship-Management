const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const announcements = require('../controllers/announcementController');

router.use(protect);

router.get('/', announcements.getAnnouncements);
router.post('/', announcements.createAnnouncement);
router.put('/:id', announcements.updateAnnouncement);
router.delete('/:id', announcements.deleteAnnouncement);

module.exports = router;