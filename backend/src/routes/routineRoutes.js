const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const routineExerciseController = require('../controllers/routineExerciseController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Routine CRUD
router.get('/', routineController.getAllRoutines);
router.get('/user/:userId', routineController.getRoutinesByUser);
router.get('/:id', routineController.getRoutineById);
router.post('/', routineController.createRoutine);
router.put('/:id', routineController.updateRoutine);
router.delete('/:id', routineController.deleteRoutine);

// Routine Exercises Management
router.get('/:routineId/exercises', routineExerciseController.getRoutineExercises);
router.post('/:routineId/exercises', routineExerciseController.addExerciseToRoutine);
router.put('/:routineId/exercises/:exerciseId', routineExerciseController.updateRoutineExercise);
router.delete('/:routineId/exercises/:exerciseId', routineExerciseController.removeExerciseFromRoutine);
router.post('/:routineId/exercises/reorder', routineExerciseController.reorderRoutineExercises);

module.exports = router;
