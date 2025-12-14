const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const gymRoutes = require('./gymRoutes');
const exerciseRoutes = require('./exerciseRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/gyms', gymRoutes);
router.use('/exercises', exerciseRoutes);

router.get('/test', (req, res) => {
    res.json({ message: 'API is working correctly' });
});

module.exports = router;
