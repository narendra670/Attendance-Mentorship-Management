const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const resources = require('../controllers/resourceController');

router.use(protect);

router.get('/', resources.getResources);
router.post('/', resources.createResource);
router.put('/:id', resources.updateResource);
router.delete('/:id', resources.deleteResource);

module.exports = router;