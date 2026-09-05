const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');

const adminOnly = [protect, authorize('admin')];

router.use(adminOnly);

router.get('/users', admin.getUsers);
router.post('/users', admin.createUser);
router.get('/users/:id', admin.getUserDetail);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);

router.get('/departments', admin.getDepartments);
router.post('/departments', admin.createDepartment);
router.put('/departments/:id', admin.updateDepartment);
router.delete('/departments/:id', admin.deleteDepartment);

router.get('/assignments', admin.getAssignments);
router.post('/assignments', admin.assignMentor);
router.put('/assignments/:id', admin.changeMentor);
router.put('/assignments/:id/remove', admin.removeMentor);

router.get('/mentor-workload', admin.getMentorWorkload);
router.get('/stats', admin.getAdminStats);

module.exports = router;