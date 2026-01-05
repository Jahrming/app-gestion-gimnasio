const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');
const dietMealController = require('../controllers/dietMealController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Diet CRUD
router.get('/', dietController.getAllDiets);
router.get('/:id', dietController.getDietById);
router.post('/', dietController.createDiet);
router.put('/:id', dietController.updateDiet);
router.delete('/:id', dietController.deleteDiet);
router.get('/user/:userId', dietController.getDietsByUser);

// Meal CRUD
router.get('/:dietId/meals', dietMealController.getDietMeals);
router.post('/:dietId/meals', dietMealController.addMeal);
router.put('/:dietId/meals/:mealId', dietMealController.updateMeal); // Note: using specialized route or could use global meals route if independent
// Correct route structure for meals under specific diet context usually preferred, 
// but query param vs path param: here using path param for clarity.
// Wait, the controller expects mealId in params. 
// Standard REST: PUT /meals/:id or PUT /diets/:dietId/meals/:mealId. 
// I'll stick to nested for context, but update controller requires correct param extraction.
// Let's verify controller... updateMeal uses { mealId } = req.params.
// So route MUST be /:something/:mealId.

router.put('/:dietId/meals/:mealId', dietMealController.updateMeal);
router.delete('/:dietId/meals/:mealId', dietMealController.deleteMeal);

module.exports = router;
