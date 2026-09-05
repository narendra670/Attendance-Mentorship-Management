const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const goals = require('../controllers/goalController');

router.use(protect);

router.get('/', goals.getGoals);
router.post('/', goals.createGoal);
router.get('/:id', goals.getGoal);
router.put('/:id', goals.updateGoal);
router.delete('/:id', goals.deleteGoal);

module.exports = router;