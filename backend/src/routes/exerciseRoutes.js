const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

router.get('/', exerciseController.getAllExercises);
router.post('/', exerciseController.createExercise);

module.exports = router;
