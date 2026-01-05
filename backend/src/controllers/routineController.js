const pool = require('../config/database');

// GET /api/routines - List routines with RBAC filtering
const getAllRoutines = async (req, res) => {
    try {
        const { role_id, gym_id, id: userId } = req.user;
        const { assigned_user_id, is_active, page = 1, limit = 20 } = req.query;

        let query = `
            SELECT r.*, 
                   creator.first_name as creator_first_name, 
                   creator.last_name as creator_last_name,
                   assigned.first_name as assigned_first_name,
                   assigned.last_name as assigned_last_name
            FROM routines r
            LEFT JOIN users creator ON r.creator_id = creator.id
            LEFT JOIN users assigned ON r.assigned_user_id = assigned.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM routines r WHERE 1=1';
        const params = [];
        const countParams = [];

        // RBAC Filtering
        if (role_id === 1) {
            // Super Admin: see all routines
        } else if (role_id === 2) {
            // Gym Owner: see routines of their gym
            query += ' AND (creator.gym_id = ? OR assigned.gym_id = ?)';
            countQuery += ' AND EXISTS (SELECT 1 FROM users u WHERE (r.creator_id = u.id OR r.assigned_user_id = u.id) AND u.gym_id = ?)';
            params.push(gym_id, gym_id);
            countParams.push(gym_id);
        } else if (role_id === 3) {
            // Trainer: see only routines they created
            query += ' AND r.creator_id = ?';
            countQuery += ' AND creator_id = ?';
            params.push(userId);
            countParams.push(userId);
        } else {
            // Client: see only routines assigned to them
            query += ' AND r.assigned_user_id = ?';
            countQuery += ' AND assigned_user_id = ?';
            params.push(userId);
            countParams.push(userId);
        }

        // Filter by assigned user
        if (assigned_user_id) {
            query += ' AND r.assigned_user_id = ?';
            countQuery += ' AND assigned_user_id = ?';
            params.push(assigned_user_id);
            countParams.push(assigned_user_id);
        }

        // Filter by active status
        if (is_active !== undefined) {
            query += ' AND r.is_active = ?';
            countQuery += ' AND is_active = ?';
            params.push(is_active === 'true' ? 1 : 0);
            countParams.push(is_active === 'true' ? 1 : 0);
        }

        // Get total count
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        // Order by created date (newest first)
        query += ' ORDER BY r.created_at DESC';

        // Pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [routines] = await pool.query(query, params);

        res.json({
            routines,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving routines', error: error.message });
    }
};

// GET /api/routines/:id - Get single routine with exercises
const getRoutineById = async (req, res) => {
    const { id } = req.params;
    const { role_id, gym_id, id: userId } = req.user;

    try {
        // Get routine basic info
        const [routines] = await pool.query(`
            SELECT r.*, 
                   creator.first_name as creator_first_name, 
                   creator.last_name as creator_last_name,
                   creator.gym_id as creator_gym_id,
                   assigned.first_name as assigned_first_name,
                   assigned.last_name as assigned_last_name,
                   assigned.gym_id as assigned_gym_id
            FROM routines r
            LEFT JOIN users creator ON r.creator_id = creator.id
            LEFT JOIN users assigned ON r.assigned_user_id = assigned.id
            WHERE r.id = ?
        `, [id]);

        if (routines.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const routine = routines[0];

        // Check permissions
        if (role_id === 2 && routine.creator_gym_id !== gym_id && routine.assigned_gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to view this routine' });
        } else if (role_id === 3 && routine.creator_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to view this routine' });
        } else if (role_id === 4 && routine.assigned_user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to view this routine' });
        }

        // Get exercises for this routine
        const [exercises] = await pool.query(`
            SELECT re.*, e.name, e.description, e.video_url, e.thumbnail_url, e.muscle_group, e.equipment_needed
            FROM routine_exercises re
            JOIN exercises e ON re.exercise_id = e.id
            WHERE re.routine_id = ?
            ORDER BY re.day_of_week, re.order_index
        `, [id]);

        routine.exercises = exercises;

        res.json(routine);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving routine', error: error.message });
    }
};

// POST /api/routines - Create new routine
const createRoutine = async (req, res) => {
    const { name, description, assigned_user_id, start_date, end_date, is_active = true } = req.body;
    const creatorId = req.user.id;
    const creatorRole = req.user.role_id;
    const creatorGymId = req.user.gym_id;

    // Validation
    if (!name) {
        return res.status(400).json({ message: 'Routine name is required' });
    }

    // RBAC: Only trainers, owners, and admins can create routines
    if (creatorRole === 4) {
        return res.status(403).json({ message: 'Clients cannot create routines' });
    }

    try {
        // If assigning to a user, verify permissions
        if (assigned_user_id) {
            const [assignedUser] = await pool.query('SELECT gym_id, created_by FROM users WHERE id = ?', [assigned_user_id]);

            if (assignedUser.length === 0) {
                return res.status(404).json({ message: 'Assigned user not found' });
            }

            // Trainer can only assign to users they created
            if (creatorRole === 3 && assignedUser[0].created_by !== creatorId) {
                return res.status(403).json({ message: 'Trainers can only assign routines to their clients' });
            }

            // Gym owner can only assign to users in their gym
            if (creatorRole === 2 && assignedUser[0].gym_id !== creatorGymId) {
                return res.status(403).json({ message: 'Cannot assign routine to user from different gym' });
            }
        }

        const [result] = await pool.query(
            'INSERT INTO routines (name, description, creator_id, assigned_user_id, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, creatorId, assigned_user_id, start_date, end_date, is_active]
        );

        res.status(201).json({
            message: 'Routine created successfully',
            routineId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating routine', error: error.message });
    }
};

// PUT /api/routines/:id - Update routine
const updateRoutine = async (req, res) => {
    const { id } = req.params;
    const { name, description, assigned_user_id, start_date, end_date, is_active } = req.body;
    const { role_id, id: userId, gym_id } = req.user;

    try {
        // Check if routine exists and get creator info
        const [existing] = await pool.query(`
            SELECT r.creator_id, u.gym_id as creator_gym_id
            FROM routines r
            JOIN users u ON r.creator_id = u.id
            WHERE r.id = ?
        `, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const routine = existing[0];

        // Check permissions: only creator, gym owner, or admin can update
        if (role_id === 3 && routine.creator_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this routine' });
        } else if (role_id === 2 && routine.creator_gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to update this routine' });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (assigned_user_id !== undefined) {
            updates.push('assigned_user_id = ?');
            values.push(assigned_user_id);
        }
        if (start_date !== undefined) {
            updates.push('start_date = ?');
            values.push(start_date);
        }
        if (end_date !== undefined) {
            updates.push('end_date = ?');
            values.push(end_date);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);

        await pool.query(
            `UPDATE routines SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Routine updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating routine', error: error.message });
    }
};

// DELETE /api/routines/:id - Delete routine (soft delete)
const deleteRoutine = async (req, res) => {
    const { id } = req.params;
    const { role_id, id: userId, gym_id } = req.user;

    try {
        // Check if routine exists
        const [existing] = await pool.query(`
            SELECT r.creator_id, u.gym_id as creator_gym_id
            FROM routines r
            JOIN users u ON r.creator_id = u.id
            WHERE r.id = ?
        `, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const routine = existing[0];

        // Check permissions
        if (role_id === 3 && routine.creator_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this routine' });
        } else if (role_id === 2 && routine.creator_gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to delete this routine' });
        }

        // Soft delete by setting is_active to false
        await pool.query('UPDATE routines SET is_active = FALSE WHERE id = ?', [id]);

        res.json({ message: 'Routine deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting routine', error: error.message });
    }
};

// GET /api/routines/user/:userId - Get routines for specific user
const getRoutinesByUser = async (req, res) => {
    const { userId } = req.params;
    const { role_id, id: requesterId, gym_id } = req.user;

    try {
        // Check permissions to view this user's routines
        const [targetUser] = await pool.query('SELECT gym_id, created_by FROM users WHERE id = ?', [userId]);

        if (targetUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Trainer can only see routines of users they created
        if (role_id === 3 && targetUser[0].created_by !== requesterId) {
            return res.status(403).json({ message: 'Unauthorized to view routines for this user' });
        }

        // Gym owner can only see routines of users in their gym
        if (role_id === 2 && targetUser[0].gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to view routines for this user' });
        }

        // Client can only see their own routines
        if (role_id === 4 && parseInt(userId) !== requesterId) {
            return res.status(403).json({ message: 'Unauthorized to view routines for this user' });
        }

        const [routines] = await pool.query(`
            SELECT r.*, 
                   creator.first_name as creator_first_name, 
                   creator.last_name as creator_last_name
            FROM routines r
            LEFT JOIN users creator ON r.creator_id = creator.id
            WHERE r.assigned_user_id = ? AND r.is_active = TRUE
            ORDER BY r.created_at DESC
        `, [userId]);

        res.json(routines);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user routines', error: error.message });
    }
};

module.exports = {
    getAllRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    getRoutinesByUser
};
