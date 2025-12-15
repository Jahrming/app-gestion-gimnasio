const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const verifyToken = require('../middleware/authMiddleware');

// Apply middleware
router.use(verifyToken);

router.get('/', gymController.getAllGyms);
router.get('/owners/available', gymController.getAvailableOwners);
router.get('/:id', gymController.getGymById);
router.post('/', gymController.createGym);
router.put('/:id', gymController.updateGym);
router.delete('/:id', gymController.deleteGym);

module.exports = router;
