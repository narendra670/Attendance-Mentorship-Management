const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const messages = require('../controllers/messageController');

router.use(protect);

router.get('/', messages.getConversations);
router.post('/', messages.sendMessage);
router.get('/:userId', messages.getConversation);
router.put('/:userId/read', messages.markRead);

module.exports = router;