const express = require('express');
const { getUsers } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
// Any logged in user can fetch users (to assign them to tasks/projects).
// In a real app, you might restrict this further, but for a task manager it's fine.
router.route('/').get(getUsers);

module.exports = router;
