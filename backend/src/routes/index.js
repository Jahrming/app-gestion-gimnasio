const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const gymRoutes = require('./gymRoutes');
const exerciseRoutes = require('./exerciseRoutes');
const routineRoutes = require('./routineRoutes');
const workoutRoutes = require('./workoutRoutes');
const dietRoutes = require('./dietRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/gyms', gymRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/routines', routineRoutes);
router.use('/workouts', workoutRoutes);
router.use('/diets', dietRoutes);

router.get('/test', (req, res) => {
    res.json({ message: 'API is working correctly' });
});

module.exports = router;
