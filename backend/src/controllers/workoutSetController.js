const pool = require('../config/database');

// GET /api/workouts/:workoutId/sets - Get all sets for a workout
const getWorkoutSets = async (req, res) => {
    const { workoutId } = req.params;
    const { exercise_id } = req.query;
    const userId = req.user.id;

    try {
        // Check if workout exists and belongs to user
        const [workouts] = await pool.query('SELECT user_id FROM workout_logs WHERE id = ?', [workoutId]);

        if (workouts.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        // Users can only view sets from their own workouts
        if (workouts[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to view sets from this workout' });
        }

        let query = `
            SELECT ws.*, 
                   e.name as exercise_name, 
                   e.muscle_group, 
                   e.equipment_needed
            FROM workout_sets ws
            JOIN exercises e ON ws.exercise_id = e.id
            WHERE ws.workout_log_id = ?
        `;
        const params = [workoutId];

        // Filter by exercise if provided
        if (exercise_id) {
            query += ' AND ws.exercise_id = ?';
            params.push(exercise_id);
        }

        query += ' ORDER BY ws.exercise_id, ws.set_number';

        const [sets] = await pool.query(query, params);

        res.json(sets);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving workout sets', error: error.message });
    }
};

// POST /api/workouts/:workoutId/sets - Log a new set
const createWorkoutSet = async (req, res) => {
    const { workoutId } = req.params;
    const { exercise_id, set_number, reps_completed, weight_used, rpe } = req.body;
    const userId = req.user.id;

    // Validation
    if (!exercise_id || set_number === undefined || !reps_completed) {
        return res.status(400).json({ message: 'Exercise ID, set number, and reps completed are required' });
    }

    if (rpe && (rpe < 1 || rpe > 10)) {
        return res.status(400).json({ message: 'RPE must be between 1 and 10' });
    }

    try {
        // Check if workout exists and belongs to user
        const [workouts] = await pool.query('SELECT user_id FROM workout_logs WHERE id = ?', [workoutId]);

        if (workouts.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workouts[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to add sets to this workout' });
        }

        // Check if exercise exists
        const [exercises] = await pool.query('SELECT id FROM exercises WHERE id = ?', [exercise_id]);
        if (exercises.length === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        // Check if set with same number already exists for this exercise in this workout
        const [existingSet] = await pool.query(
            'SELECT id FROM workout_sets WHERE workout_log_id = ? AND exercise_id = ? AND set_number = ?',
            [workoutId, exercise_id, set_number]
        );

        if (existingSet.length > 0) {
            return res.status(409).json({
                message: 'Set number already exists for this exercise in this workout. Use update instead.'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO workout_sets (workout_log_id, exercise_id, set_number, reps_completed, weight_used, rpe) VALUES (?, ?, ?, ?, ?, ?)',
            [workoutId, exercise_id, set_number, reps_completed, weight_used, rpe]
        );

        res.status(201).json({
            message: 'Workout set logged successfully',
            setId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging workout set', error: error.message });
    }
};

// PUT /api/workouts/:workoutId/sets/:setId - Update a set
const updateWorkoutSet = async (req, res) => {
    const { workoutId, setId } = req.params;
    const { set_number, reps_completed, weight_used, rpe } = req.body;
    const userId = req.user.id;

    if (rpe && (rpe < 1 || rpe > 10)) {
        return res.status(400).json({ message: 'RPE must be between 1 and 10' });
    }

    try {
        // Check if workout exists and belongs to user
        const [workouts] = await pool.query('SELECT user_id FROM workout_logs WHERE id = ?', [workoutId]);

        if (workouts.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workouts[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update sets in this workout' });
        }

        // Check if set exists in this workout
        const [existing] = await pool.query(
            'SELECT id FROM workout_sets WHERE id = ? AND workout_log_id = ?',
            [setId, workoutId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Set not found in this workout' });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (set_number !== undefined) {
            updates.push('set_number = ?');
            values.push(set_number);
        }
        if (reps_completed !== undefined) {
            updates.push('reps_completed = ?');
            values.push(reps_completed);
        }
        if (weight_used !== undefined) {
            updates.push('weight_used = ?');
            values.push(weight_used);
        }
        if (rpe !== undefined) {
            updates.push('rpe = ?');
            values.push(rpe);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(setId);

        await pool.query(
            `UPDATE workout_sets SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Workout set updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating workout set', error: error.message });
    }
};

// DELETE /api/workouts/:workoutId/sets/:setId - Delete a set
const deleteWorkoutSet = async (req, res) => {
    const { workoutId, setId } = req.params;
    const userId = req.user.id;

    try {
        // Check if workout exists and belongs to user
        const [workouts] = await pool.query('SELECT user_id FROM workout_logs WHERE id = ?', [workoutId]);

        if (workouts.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workouts[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete sets from this workout' });
        }

        // Check if set exists in this workout
        const [existing] = await pool.query(
            'SELECT id FROM workout_sets WHERE id = ? AND workout_log_id = ?',
            [setId, workoutId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Set not found in this workout' });
        }

        await pool.query('DELETE FROM workout_sets WHERE id = ?', [setId]);

        res.json({ message: 'Workout set deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workout set', error: error.message });
    }
};

// POST /api/workouts/:workoutId/sets/bulk - Log multiple sets at once
const createBulkWorkoutSets = async (req, res) => {
    const { workoutId } = req.params;
    const { sets } = req.body; // Array of set objects
    const userId = req.user.id;

    if (!Array.isArray(sets) || sets.length === 0) {
        return res.status(400).json({ message: 'Sets array is required' });
    }

    try {
        // Check if workout exists and belongs to user
        const [workouts] = await pool.query('SELECT user_id FROM workout_logs WHERE id = ?', [workoutId]);

        if (workouts.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workouts[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to add sets to this workout' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const insertedIds = [];

            for (const set of sets) {
                const { exercise_id, set_number, reps_completed, weight_used, rpe } = set;

                // Validate each set
                if (!exercise_id || set_number === undefined || !reps_completed) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        message: 'Each set must have exercise_id, set_number, and reps_completed'
                    });
                }

                const [result] = await connection.query(
                    'INSERT INTO workout_sets (workout_log_id, exercise_id, set_number, reps_completed, weight_used, rpe) VALUES (?, ?, ?, ?, ?, ?)',
                    [workoutId, exercise_id, set_number, reps_completed, weight_used, rpe]
                );

                insertedIds.push(result.insertId);
            }

            await connection.commit();
            res.status(201).json({
                message: `${sets.length} workout sets logged successfully`,
                setIds: insertedIds
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging bulk workout sets', error: error.message });
    }
};

module.exports = {
    getWorkoutSets,
    createWorkoutSet,
    updateWorkoutSet,
    deleteWorkoutSet,
    createBulkWorkoutSets
};
