const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const workoutSetController = require('../controllers/workoutSetController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Workout CRUD
router.get('/', workoutController.getAllWorkouts);
router.get('/user/:userId/stats', workoutController.getWorkoutStats);
router.get('/:id', workoutController.getWorkoutById);
router.post('/', workoutController.createWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

// Workout Sets Management
router.get('/:workoutId/sets', workoutSetController.getWorkoutSets);
router.post('/:workoutId/sets', workoutSetController.createWorkoutSet);
router.post('/:workoutId/sets/bulk', workoutSetController.createBulkWorkoutSets);
router.put('/:workoutId/sets/:setId', workoutSetController.updateWorkoutSet);
router.delete('/:workoutId/sets/:setId', workoutSetController.deleteWorkoutSet);

module.exports = router;
