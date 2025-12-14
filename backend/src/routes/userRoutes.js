const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// Apply middleware to all routes
router.use(verifyToken);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser); // New create route
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
