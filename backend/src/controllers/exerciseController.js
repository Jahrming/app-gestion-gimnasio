const pool = require('../config/database');

// GET /api/exercises - List all exercises with optional filters
const getAllExercises = async (req, res) => {
    try {
        const { search, muscle_group, page = 1, limit = 50 } = req.query;

        let query = 'SELECT * FROM exercises WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM exercises WHERE 1=1';
        const params = [];
        const countParams = [];

        // Filter by muscle group
        if (muscle_group) {
            query += ' AND muscle_group = ?';
            countQuery += ' AND muscle_group = ?';
            params.push(muscle_group);
            countParams.push(muscle_group);
        }

        // Search by name or description
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            countQuery += ' AND (name LIKE ? OR description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Get total count
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        // Order by name
        query += ' ORDER BY name ASC';

        // Pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [exercises] = await pool.query(query, params);

        res.json({
            exercises,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving exercises', error: error.message });
    }
};

// GET /api/exercises/:id - Get single exercise by ID
const getExerciseById = async (req, res) => {
    const { id } = req.params;

    try {
        const [exercises] = await pool.query('SELECT * FROM exercises WHERE id = ?', [id]);

        if (exercises.length === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.json(exercises[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving exercise', error: error.message });
    }
};

// POST /api/exercises - Create new exercise
const createExercise = async (req, res) => {
    const { name, description, video_url, thumbnail_url, muscle_group, equipment_needed } = req.body;

    // Validation
    if (!name || !muscle_group) {
        return res.status(400).json({ message: 'Name and muscle group are required' });
    }

    try {
        // Check if exercise already exists
        const [existing] = await pool.query('SELECT id FROM exercises WHERE name = ?', [name]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Exercise with this name already exists' });
        }

        const [result] = await pool.query(
            'INSERT INTO exercises (name, description, video_url, thumbnail_url, muscle_group, equipment_needed) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, video_url, thumbnail_url, muscle_group, equipment_needed]
        );

        res.status(201).json({
            message: 'Exercise created successfully',
            exerciseId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating exercise', error: error.message });
    }
};

// PUT /api/exercises/:id - Update exercise
const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { name, description, video_url, thumbnail_url, muscle_group, equipment_needed } = req.body;

    try {
        // Check if exercise exists
        const [existing] = await pool.query('SELECT id FROM exercises WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        // Check for duplicate name (excluding current exercise)
        if (name) {
            const [duplicate] = await pool.query(
                'SELECT id FROM exercises WHERE name = ? AND id != ?',
                [name, id]
            );
            if (duplicate.length > 0) {
                return res.status(409).json({ message: 'Another exercise with this name already exists' });
            }
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
        if (video_url !== undefined) {
            updates.push('video_url = ?');
            values.push(video_url);
        }
        if (thumbnail_url !== undefined) {
            updates.push('thumbnail_url = ?');
            values.push(thumbnail_url);
        }
        if (muscle_group !== undefined) {
            updates.push('muscle_group = ?');
            values.push(muscle_group);
        }
        if (equipment_needed !== undefined) {
            updates.push('equipment_needed = ?');
            values.push(equipment_needed);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);

        await pool.query(
            `UPDATE exercises SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Exercise updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating exercise', error: error.message });
    }
};

// DELETE /api/exercises/:id - Delete exercise
const deleteExercise = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if exercise exists
        const [existing] = await pool.query('SELECT id FROM exercises WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        // Check if exercise is used in any routines
        const [routineUsage] = await pool.query(
            'SELECT COUNT(*) as count FROM routine_exercises WHERE exercise_id = ?',
            [id]
        );

        if (routineUsage[0].count > 0) {
            return res.status(409).json({
                message: 'Cannot delete exercise: it is being used in active routines',
                routinesCount: routineUsage[0].count
            });
        }

        await pool.query('DELETE FROM exercises WHERE id = ?', [id]);

        res.json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exercise', error: error.message });
    }
};

// GET /api/exercises/muscle-groups - Get list of unique muscle groups
const getMuscleGroups = async (req, res) => {
    try {
        const [groups] = await pool.query(
            'SELECT DISTINCT muscle_group FROM exercises WHERE muscle_group IS NOT NULL ORDER BY muscle_group'
        );

        res.json(groups.map(g => g.muscle_group));
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving muscle groups', error: error.message });
    }
};

module.exports = {
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    getMuscleGroups
};
