const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get unique muscle groups
router.get('/muscle-groups', exerciseController.getMuscleGroups);

// CRUD operations
router.get('/', exerciseController.getAllExercises);
router.get('/:id', exerciseController.getExerciseById);
router.post('/', exerciseController.createExercise);
router.put('/:id', exerciseController.updateExercise);
router.delete('/:id', exerciseController.deleteExercise);

module.exports = router;
