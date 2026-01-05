const pool = require('../../database/db');

// Get meals for a specific diet
const getDietMeals = async (req, res) => {
    try {
        const { dietId } = req.params;
        const [meals] = await pool.query(
            `SELECT * FROM diet_meals WHERE diet_id = ? ORDER BY time_of_day ASC`,
            [dietId]
        );
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving meals', error: error.message });
    }
};

// Add a meal to a diet
const addMeal = async (req, res) => {
    try {
        const { dietId } = req.params;
        const { name, time_of_day, description, calories, protein_g, carbs_g, fats_g } = req.body;

        const [result] = await pool.query(
            `INSERT INTO diet_meals (diet_id, name, time_of_day, description, calories, protein_g, carbs_g, fats_g) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [dietId, name, time_of_day, description, calories, protein_g, carbs_g, fats_g]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Meal added successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding meal', error: error.message });
    }
};

// Update a meal
const updateMeal = async (req, res) => {
    try {
        const { mealId } = req.params;
        const { name, time_of_day, description, calories, protein_g, carbs_g, fats_g } = req.body;

        await pool.query(
            `UPDATE diet_meals SET name = ?, time_of_day = ?, description = ?, calories = ?, protein_g = ?, carbs_g = ?, fats_g = ? WHERE id = ?`,
            [name, time_of_day, description, calories, protein_g, carbs_g, fats_g, mealId]
        );

        res.json({ message: 'Meal updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating meal', error: error.message });
    }
};

// Delete a meal
const deleteMeal = async (req, res) => {
    try {
        const { mealId } = req.params;
        await pool.query('DELETE FROM diet_meals WHERE id = ?', [mealId]);
        res.json({ message: 'Meal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting meal', error: error.message });
    }
};

module.exports = {
    getDietMeals,
    addMeal,
    updateMeal,
    deleteMeal
};
