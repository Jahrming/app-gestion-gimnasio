const pool = require('../config/database');

// GET /api/workouts - List workouts with RBAC filtering
const getAllWorkouts = async (req, res) => {
    try {
        const { role_id, gym_id, id: userId } = req.user;
        const { user_id, routine_id, start_date, end_date, page = 1, limit = 20 } = req.query;

        let query = `
            SELECT w.*, 
                   u.first_name, u.last_name,
                   r.name as routine_name
            FROM workout_logs w
            JOIN users u ON w.user_id = u.id
            LEFT JOIN routines r ON w.routine_id = r.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM workout_logs w JOIN users u ON w.user_id = u.id WHERE 1=1';
        const params = [];
        const countParams = [];

        // RBAC Filtering
        if (role_id === 1) {
            // Super Admin: see all workouts
        } else if (role_id === 2) {
            // Gym Owner: see workouts from their gym
            query += ' AND u.gym_id = ?';
            countQuery += ' AND u.gym_id = ?';
            params.push(gym_id);
            countParams.push(gym_id);
        } else if (role_id === 3) {
            // Trainer: see workouts from users they created
            query += ' AND u.created_by = ?';
            countQuery += ' AND u.created_by = ?';
            params.push(userId);
            countParams.push(userId);
        } else {
            // Client: see only their own workouts
            query += ' AND w.user_id = ?';
            countQuery += ' AND user_id = ?';
            params.push(userId);
            countParams.push(userId);
        }

        // Filter by specific user
        if (user_id) {
            query += ' AND w.user_id = ?';
            countQuery += ' AND user_id = ?';
            params.push(user_id);
            countParams.push(user_id);
        }

        // Filter by routine
        if (routine_id) {
            query += ' AND w.routine_id = ?';
            countQuery += ' AND routine_id = ?';
            params.push(routine_id);
            countParams.push(routine_id);
        }

        // Filter by date range
        if (start_date) {
            query += ' AND DATE(w.date) >= ?';
            countQuery += ' AND DATE(w.date) >= ?';
            params.push(start_date);
            countParams.push(start_date);
        }
        if (end_date) {
            query += ' AND DATE(w.date) <= ?';
            countQuery += ' AND DATE(w.date) <= ?';
            params.push(end_date);
            countParams.push(end_date);
        }

        // Get total count
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        // Order by date (newest first)
        query += ' ORDER BY w.date DESC';

        // Pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [workouts] = await pool.query(query, params);

        res.json({
            workouts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving workouts', error: error.message });
    }
};

// GET /api/workouts/:id - Get single workout with sets
const getWorkoutById = async (req, res) => {
    const { id } = req.params;
    const { role_id, gym_id, id: userId } = req.user;

    try {
        // Get workout basic info
        const [workouts] = await pool.query(`
            SELECT w.*, 
                   u.first_name, u.last_name, u.gym_id,
                   r.name as routine_name
            FROM workout_logs w
            JOIN users u ON w.user_id = u.id
            LEFT JOIN routines r ON w.routine_id = r.id
            WHERE w.id = ?
        `, [id]);

        if (workouts.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        const workout = workouts[0];

        // Check permissions
        if (role_id === 2 && workout.gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to view this workout' });
        } else if (role_id === 3) {
            const [userCheck] = await pool.query('SELECT created_by FROM users WHERE id = ?', [workout.user_id]);
            if (userCheck.length > 0 && userCheck[0].created_by !== userId) {
                return res.status(403).json({ message: 'Unauthorized to view this workout' });
            }
        } else if (role_id === 4 && workout.user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to view this workout' });
        }

        // Get sets for this workout
        const [sets] = await pool.query(`
            SELECT ws.*, e.name as exercise_name, e.muscle_group
            FROM workout_sets ws
            JOIN exercises e ON ws.exercise_id = e.id
            WHERE ws.workout_log_id = ?
            ORDER BY ws.exercise_id, ws.set_number
        `, [id]);

        workout.sets = sets;

        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving workout', error: error.message });
    }
};

// POST /api/workouts - Create new workout log
const createWorkout = async (req, res) => {
    const { routine_id, notes, duration_minutes } = req.body;
    const user_id = req.user.id; // Workouts are always for the authenticated user

    try {
        // If routine_id provided, verify it's assigned to the user
        if (routine_id) {
            const [routines] = await pool.query(
                'SELECT id FROM routines WHERE id = ? AND assigned_user_id = ?',
                [routine_id, user_id]
            );

            if (routines.length === 0) {
                return res.status(404).json({ message: 'Routine not found or not assigned to you' });
            }
        }

        const [result] = await pool.query(
            'INSERT INTO workout_logs (user_id, routine_id, notes, duration_minutes) VALUES (?, ?, ?, ?)',
            [user_id, routine_id, notes, duration_minutes]
        );

        res.status(201).json({
            message: 'Workout created successfully',
            workoutId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating workout', error: error.message });
    }
};

// PUT /api/workouts/:id - Update workout (complete it, add notes, etc.)
const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { notes, duration_minutes } = req.body;
    const userId = req.user.id;

    try {
        // Check if workout exists and belongs to user
        const [existing] = await pool.query('SELECT user_id FROM workout_logs WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        // Users can only update their own workouts
        if (existing[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this workout' });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }
        if (duration_minutes !== undefined) {
            updates.push('duration_minutes = ?');
            values.push(duration_minutes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);

        await pool.query(
            `UPDATE workout_logs SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Workout updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating workout', error: error.message });
    }
};

// DELETE /api/workouts/:id - Delete workout
const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check if workout exists and belongs to user
        const [existing] = await pool.query('SELECT user_id FROM workout_logs WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        // Users can only delete their own workouts
        if (existing[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this workout' });
        }

        // Delete workout (cascade will delete sets)
        await pool.query('DELETE FROM workout_logs WHERE id = ?', [id]);

        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workout', error: error.message });
    }
};

// GET /api/workouts/user/:userId/stats - Get workout statistics for a user
const getWorkoutStats = async (req, res) => {
    const { userId } = req.params;
    const { role_id, id: requesterId, gym_id } = req.user;
    const { start_date, end_date } = req.query;

    try {
        // Check permissions
        const [targetUser] = await pool.query('SELECT gym_id, created_by FROM users WHERE id = ?', [userId]);

        if (targetUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role_id === 3 && targetUser[0].created_by !== requesterId) {
            return res.status(403).json({ message: 'Unauthorized to view stats for this user' });
        } else if (role_id === 2 && targetUser[0].gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to view stats for this user' });
        } else if (role_id === 4 && parseInt(userId) !== requesterId) {
            return res.status(403).json({ message: 'Unauthorized to view stats for this user' });
        }

        let dateFilter = '';
        const params = [userId];

        if (start_date && end_date) {
            dateFilter = ' AND DATE(date) BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }

        // Get total workouts
        const [totalWorkouts] = await pool.query(
            `SELECT COUNT(*) as total FROM workout_logs WHERE user_id = ?${dateFilter}`,
            params
        );

        // Get average duration
        const [avgDuration] = await pool.query(
            `SELECT AVG(duration_minutes) as avg_duration FROM workout_logs WHERE user_id = ? AND duration_minutes IS NOT NULL${dateFilter}`,
            params
        );

        // Get total volume (sum of all weight * reps)
        const [totalVolume] = await pool.query(
            `SELECT SUM(ws.weight_used * ws.reps_completed) as total_volume
             FROM workout_sets ws
             JOIN workout_logs wl ON ws.workout_log_id = wl.id
             WHERE wl.user_id = ?${dateFilter}`,
            params
        );

        // Get workouts by muscle group
        const [muscleGroupStats] = await pool.query(
            `SELECT e.muscle_group, COUNT(DISTINCT ws.workout_log_id) as workout_count
             FROM workout_sets ws
             JOIN exercises e ON ws.exercise_id = e.id
             JOIN workout_logs wl ON ws.workout_log_id = wl.id
             WHERE wl.user_id = ?${dateFilter}
             GROUP BY e.muscle_group
             ORDER BY workout_count DESC`,
            params
        );

        res.json({
            total_workouts: totalWorkouts[0].total,
            average_duration: avgDuration[0].avg_duration || 0,
            total_volume: totalVolume[0].total_volume || 0,
            muscle_group_distribution: muscleGroupStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving workout stats', error: error.message });
    }
};

module.exports = {
    getAllWorkouts,
    getWorkoutById,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutStats
};
