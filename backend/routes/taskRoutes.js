const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const tasks = require('../controllers/taskController');

router.use(protect);

router.get('/', tasks.getTasks);
router.post('/', tasks.createTask);
router.put('/:id', tasks.updateTask);
router.delete('/:id', tasks.deleteTask);

module.exports = router;