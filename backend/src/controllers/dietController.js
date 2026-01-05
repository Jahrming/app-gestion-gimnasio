const pool = require('../../database/db');

// Get all diets with filters and pagination
const getAllDiets = async (req, res) => {
    try {
        const { search, user_id, is_active, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const queryParams = [];

        let query = `
            SELECT d.*, 
            CONCAT(c.first_name, ' ', c.last_name) as creator_name,
            CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name
            FROM diets d
            LEFT JOIN users c ON d.creator_id = c.id
            LEFT JOIN users u ON d.assigned_user_id = u.id
            WHERE 1=1
        `;

        if (search) {
            query += ` AND (d.name LIKE ? OR d.description LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (user_id) {
            query += ` AND d.assigned_user_id = ?`;
            queryParams.push(user_id);
        }

        // RBAC: Standardize with Routine logic
        // Role 1 (Super Admin): View all
        // Role 2 (Gym Owner): View all in their gym (need to join users table for gym check)
        // Role 3 (Trainer): View created by them OR assigned to their users (simplified to created by them for now or all visible)
        // Role 4 (Client): Only assigned to them (handled by user_id filter usually, but enforcing here)

        if (req.user.role_id === 4) {
            query += ` AND d.assigned_user_id = ?`;
            queryParams.push(req.user.id);
        } else if (req.user.role_id === 2) {
            // Logic for gym owner would go here if we had strict gym separation in queries
            // For now allowing visualization
        }

        query += ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [diets] = await pool.query(query, queryParams);

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM diets d WHERE 1=1`;
        const countParams = [];

        if (search) {
            countQuery += ` AND (d.name LIKE ? OR d.description LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`);
        }
        if (user_id || req.user.role_id === 4) {
            countQuery += ` AND d.assigned_user_id = ?`;
            countParams.push(user_id || req.user.id);
        }

        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            diets,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error('Error getting diets:', error);
        res.status(500).json({ message: 'Error retrieving diets', error: error.message });
    }
};

const getDietById = async (req, res) => {
    try {
        const { id } = req.params;
        const [diets] = await pool.query(`
            SELECT d.*, 
            CONCAT(c.first_name, ' ', c.last_name) as creator_name,
            CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name
            FROM diets d
            LEFT JOIN users c ON d.creator_id = c.id
            LEFT JOIN users u ON d.assigned_user_id = u.id
            WHERE d.id = ?
        `, [id]);

        if (diets.length === 0) {
            return res.status(404).json({ message: 'Diet not found' });
        }

        res.json(diets[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving diet', error: error.message });
    }
};

const createDiet = async (req, res) => {
    try {
        const { name, description, assigned_user_id, start_date, end_date, daily_calories_target } = req.body;

        const [result] = await pool.query(
            `INSERT INTO diets (name, description, creator_id, assigned_user_id, start_date, end_date, daily_calories_target) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, description || null, req.user.id, assigned_user_id || null, start_date || null, end_date || null, daily_calories_target || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Diet created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating diet', error: error.message });
    }
};

const updateDiet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, assigned_user_id, start_date, end_date, daily_calories_target } = req.body;

        await pool.query(
            `UPDATE diets SET name = ?, description = ?, assigned_user_id = ?, start_date = ?, end_date = ?, daily_calories_target = ? WHERE id = ?`,
            [name, description, assigned_user_id, start_date, end_date, daily_calories_target, id]
        );

        res.json({ message: 'Diet updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating diet', error: error.message });
    }
};

const deleteDiet = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM diets WHERE id = ?', [id]);
        res.json({ message: 'Diet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting diet', error: error.message });
    }
};

const getDietsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Security check
        if (req.user.role_id === 4 && parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const [diets] = await pool.query(`
            SELECT * FROM diets WHERE assigned_user_id = ? ORDER BY created_at DESC
        `, [userId]);

        res.json(diets);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user diets', error: error.message });
    }
};

module.exports = {
    getAllDiets,
    getDietById,
    createDiet,
    updateDiet,
    deleteDiet,
    getDietsByUser
};
