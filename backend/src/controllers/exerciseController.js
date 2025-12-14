const pool = require('../config/database');

const getAllExercises = async (req, res) => {
    try {
        const [exercises] = await pool.query('SELECT * FROM exercises');
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving exercises', error: error.message });
    }
};

const createExercise = async (req, res) => {
    const { name, description, muscle_group, equipment_needed } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO exercises (name, description, muscle_group, equipment_needed) VALUES (?, ?, ?, ?)',
            [name, description, muscle_group, equipment_needed]
        );
        res.status(201).json({ message: 'Exercise created', exerciseId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating exercise', error: error.message });
    }
};

module.exports = { getAllExercises, createExercise };
