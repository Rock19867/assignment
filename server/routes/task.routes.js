const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/task.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getTasks)
  .post(protect, authorize('Admin'), createTask);

router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask) // Members can update status
  .delete(protect, authorize('Admin'), deleteTask);

module.exports = router;
