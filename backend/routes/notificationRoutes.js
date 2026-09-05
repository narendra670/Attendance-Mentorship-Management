const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notifications = require('../controllers/notificationController');

router.use(protect);

router.get('/', notifications.getMyNotifications);
router.put('/read-all', notifications.markAllRead);
router.put('/:id/read', notifications.markRead);
router.delete('/:id', notifications.deleteNotification);

module.exports = router;