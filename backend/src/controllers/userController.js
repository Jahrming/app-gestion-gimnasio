const pool = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const { role_id, gym_id } = req.user;
        let query = 'SELECT id, email, first_name, last_name, role_id, gym_id, is_active FROM users WHERE is_active = TRUE';
        let params = [];

        // RBAC: Gym Owner can only see users in their gym
        if (role_id === 2) { // Gym Owner
            query += ' AND gym_id = ?';
            params.push(gym_id);
        } else if (role_id !== 1) { // Not Super Admin
            // Other roles shouldn't see the full list, but for now we restrict to self or empty
            // query += ' AND id = ?'; params.push(req.user.id);
        }

        const [users] = await pool.query(query, params);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.query('SELECT id, email, first_name, last_name, bio, profile_picture_url, role_id, gym_id FROM users WHERE id = ? AND is_active = TRUE', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

const createUser = async (req, res) => {
    const { email, password, first_name, last_name, role_id, gym_id } = req.body;
    const creatorRole = req.user.role_id;
    const creatorGymId = req.user.gym_id;

    // RBAC: Only Admin (1) and Owner (2) can create users
    if (creatorRole !== 1 && creatorRole !== 2) {
        return res.status(403).json({ message: 'Unauthorized to create users' });
    }

    // RBAC: Owner can only create Trainers (3) or Clients (4)
    if (creatorRole === 2 && (role_id === 1 || role_id === 2)) {
        return res.status(403).json({ message: 'Gym Owners can only create Trainers or Clients' });
    }

    // Force gym_id for Owner
    const targetGymId = creatorRole === 2 ? creatorGymId : gym_id;

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role_id, gym_id) VALUES (?, ?, ?, ?, ?, ?)',
            [email, password, first_name, last_name, role_id || 4, targetGymId]
        );

        res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, bio } = req.body;

    try {
        await pool.query(
            'UPDATE users SET first_name = ?, last_name = ?, bio = ? WHERE id = ?',
            [first_name, last_name, bio, id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const { role_id, gym_id } = req.user;

    try {
        // Check if user exists and belongs to the same gym (if owner)
        const [users] = await pool.query('SELECT gym_id FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        if (role_id === 2 && users[0].gym_id !== gym_id) {
            return res.status(403).json({ message: 'Unauthorized to delete this user' });
        }

        // Soft delete
        await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
