const pool = require('../config/database');

// GET /api/routines/:routineId/exercises - Get exercises for a routine
const getRoutineExercises = async (req, res) => {
    const { routineId } = req.params;
    const { day_of_week } = req.query;

    try {
        let query = `
            SELECT re.*, 
                   e.name, e.description, e.video_url, e.thumbnail_url, 
                   e.muscle_group, e.equipment_needed
            FROM routine_exercises re
            JOIN exercises e ON re.exercise_id = e.id
            WHERE re.routine_id = ?
        `;
        const params = [routineId];

        // Filter by day if provided
        if (day_of_week) {
            query += ' AND re.day_of_week = ?';
            params.push(day_of_week);
        }

        query += ' ORDER BY re.day_of_week, re.order_index';

        const [exercises] = await pool.query(query, params);

        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving routine exercises', error: error.message });
    }
};

// POST /api/routines/:routineId/exercises - Add exercise to routine
const addExerciseToRoutine = async (req, res) => {
    const { routineId } = req.params;
    const {
        exercise_id,
        day_of_week,
        sets,
        reps_min,
        reps_max,
        target_weight,
        rest_seconds,
        notes,
        order_index
    } = req.body;
    const { role_id, id: userId, gym_id } = req.user;

    // Validation
    if (!exercise_id || !day_of_week) {
        return res.status(400).json({ message: 'Exercise ID and day of week are required' });
    }

    if (day_of_week < 1 || day_of_week > 7) {
        return res.status(400).json({ message: 'Day of week must be between 1 (Monday) and 7 (Sunday)' });
    }

    try {
        // Check if routine exists and get creator
        const [routines] = await pool.query(`
            SELECT r.creator_id, u.gym_id as creator_gym_id
            FROM routines r
            JOIN users u ON r.creator_id = u.id
            WHERE r.id = ?
        `, [routineId]);

        if (routines.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const routine = routines[0];

        // Check permissions
        if (role_id === 3 && routine.creator_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 2 && routine.creator_gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 4) {
            return res.status(403).json({ message: 'Clients cannot modify routines' });
        }

        // Check if exercise exists
        const [exercises] = await pool.query('SELECT id FROM exercises WHERE id = ?', [exercise_id]);
        if (exercises.length === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        // Get next order_index if not provided
        let finalOrderIndex = order_index;
        if (finalOrderIndex === undefined) {
            const [maxOrder] = await pool.query(
                'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM routine_exercises WHERE routine_id = ? AND day_of_week = ?',
                [routineId, day_of_week]
            );
            finalOrderIndex = maxOrder[0].next_order;
        }

        const [result] = await pool.query(
            `INSERT INTO routine_exercises 
            (routine_id, exercise_id, day_of_week, sets, reps_min, reps_max, target_weight, rest_seconds, notes, order_index) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [routineId, exercise_id, day_of_week, sets, reps_min, reps_max, target_weight, rest_seconds, notes, finalOrderIndex]
        );

        res.status(201).json({
            message: 'Exercise added to routine successfully',
            routineExerciseId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding exercise to routine', error: error.message });
    }
};

// PUT /api/routines/:routineId/exercises/:exerciseId - Update exercise in routine
const updateRoutineExercise = async (req, res) => {
    const { routineId, exerciseId } = req.params;
    const {
        day_of_week,
        sets,
        reps_min,
        reps_max,
        target_weight,
        rest_seconds,
        notes,
        order_index
    } = req.body;
    const { role_id, id: userId, gym_id } = req.user;

    try {
        // Check if routine exists and get creator
        const [routines] = await pool.query(`
            SELECT r.creator_id, u.gym_id as creator_gym_id
            FROM routines r
            JOIN users u ON r.creator_id = u.id
            WHERE r.id = ?
        `, [routineId]);

        if (routines.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const routine = routines[0];

        // Check permissions
        if (role_id === 3 && routine.creator_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 2 && routine.creator_gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 4) {
            return res.status(403).json({ message: 'Clients cannot modify routines' });
        }

        // Check if routine exercise exists
        const [existing] = await pool.query(
            'SELECT id FROM routine_exercises WHERE id = ? AND routine_id = ?',
            [exerciseId, routineId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Exercise not found in this routine' });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (day_of_week !== undefined) {
            if (day_of_week < 1 || day_of_week > 7) {
                return res.status(400).json({ message: 'Day of week must be between 1 and 7' });
            }
            updates.push('day_of_week = ?');
            values.push(day_of_week);
        }
        if (sets !== undefined) {
            updates.push('sets = ?');
            values.push(sets);
        }
        if (reps_min !== undefined) {
            updates.push('reps_min = ?');
            values.push(reps_min);
        }
        if (reps_max !== undefined) {
            updates.push('reps_max = ?');
            values.push(reps_max);
        }
        if (target_weight !== undefined) {
            updates.push('target_weight = ?');
            values.push(target_weight);
        }
        if (rest_seconds !== undefined) {
            updates.push('rest_seconds = ?');
            values.push(rest_seconds);
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }
        if (order_index !== undefined) {
            updates.push('order_index = ?');
            values.push(order_index);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(exerciseId);

        await pool.query(
            `UPDATE routine_exercises SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Routine exercise updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating routine exercise', error: error.message });
    }
};

// DELETE /api/routines/:routineId/exercises/:exerciseId - Remove exercise from routine
const removeExerciseFromRoutine = async (req, res) => {
    const { routineId, exerciseId } = req.params;
    const { role_id, id: userId, gym_id } = req.user;

    try {
        // Check if routine exists and get creator
        const [routines] = await pool.query(`
            SELECT r.creator_id, u.gym_id as creator_gym_id
            FROM routines r
            JOIN users u ON r.creator_id = u.id
            WHERE r.id = ?
        `, [routineId]);

        if (routines.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const routine = routines[0];

        // Check permissions
        if (role_id === 3 && routine.creator_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 2 && routine.creator_gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 4) {
            return res.status(403).json({ message: 'Clients cannot modify routines' });
        }

        // Check if exercise exists in routine
        const [existing] = await pool.query(
            'SELECT id FROM routine_exercises WHERE id = ? AND routine_id = ?',
            [exerciseId, routineId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Exercise not found in this routine' });
        }

        await pool.query('DELETE FROM routine_exercises WHERE id = ?', [exerciseId]);

        res.json({ message: 'Exercise removed from routine successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing exercise from routine', error: error.message });
    }
};

// POST /api/routines/:routineId/exercises/reorder - Reorder exercises in a routine
const reorderRoutineExercises = async (req, res) => {
    const { routineId } = req.params;
    const { exercises } = req.body; // Array of {id, order_index}
    const { role_id, id: userId, gym_id } = req.user;

    if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ message: 'Exercises array is required' });
    }

    try {
        // Check if routine exists and get creator
        const [routines] = await pool.query(`
            SELECT r.creator_id, u.gym_id as creator_gym_id
            FROM routines r
            JOIN users u ON r.creator_id = u.id
            WHERE r.id = ?
        `, [routineId]);

        if (routines.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const routine = routines[0];

        // Check permissions
        if (role_id === 3 && routine.creator_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 2 && routine.creator_gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to modify this routine' });
        } else if (role_id === 4) {
            return res.status(403).json({ message: 'Clients cannot modify routines' });
        }

        // Update order for each exercise
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const exercise of exercises) {
                await connection.query(
                    'UPDATE routine_exercises SET order_index = ? WHERE id = ? AND routine_id = ?',
                    [exercise.order_index, exercise.id, routineId]
                );
            }

            await connection.commit();
            res.json({ message: 'Exercises reordered successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ message: 'Error reordering exercises', error: error.message });
    }
};

module.exports = {
    getRoutineExercises,
    addExerciseToRoutine,
    updateRoutineExercise,
    removeExerciseFromRoutine,
    reorderRoutineExercises
};
