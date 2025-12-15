const pool = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const { role_id, gym_id, id: userId } = req.user;
        let query = 'SELECT id, email, first_name, last_name, role_id, gym_id, is_active, created_by FROM users';
        let params = [];
        let whereConditions = [];

        if (role_id === 1) {
            // Super Admin: ve TODOS los usuarios
            // Sin filtros adicionales
        } else if (role_id === 2) {
            // Gym Owner: ve usuarios de su gym + usuarios creados por trainers de su gym
            whereConditions.push(`(
                (gym_id = ?) 
                OR (created_by IN (SELECT id FROM users WHERE gym_id = ? AND role_id = 3))
                OR (created_by = ?)
            )`);
            params.push(gym_id, gym_id, userId);
        } else if (role_id === 3) {
            // Trainer: ve solo usuarios que él creó y que pertenecen a su gym
            whereConditions.push('created_by = ? AND gym_id = ?');
            params.push(userId, gym_id);
        } else {
            // Otros roles: solo ven su propio perfil
            whereConditions.push('id = ?');
            params.push(userId);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

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
    const creatorId = req.user.id;

    // RBAC: Validar quién puede crear users
    if (creatorRole !== 1 && creatorRole !== 2 && creatorRole !== 3) {
        return res.status(403).json({ message: 'Unauthorized to create users' });
    }

    // RBAC: Restricciones por rol del creador
    if (creatorRole === 3) { // Trainer
        // Trainers solo pueden crear Athletes (4)
        if (role_id !== 4) {
            return res.status(403).json({ message: 'Trainers can only create Athletes' });
        }
    }

    if (creatorRole === 2) { // Gym Owner
        // Owners solo pueden crear Trainers (3) o Athletes (4)
        if (role_id === 1 || role_id === 2) {
            return res.status(403).json({ message: 'Gym Owners cannot create Super Admins or Gym Owners' });
        }
    }

    // Force gym_id para Owner y Trainer
    let targetGymId = gym_id;
    if (creatorRole === 2 || creatorRole === 3) {
        targetGymId = creatorGymId;
    }

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role_id, gym_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, password, first_name, last_name, role_id || 4, targetGymId, creatorId]
        );

        res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, bio, is_active, role_id } = req.body;
    const updaterRole = req.user.role_id;
    const updaterId = req.user.id;

    try {
        // Verificar permisos para cambiar estado o rol
        const [targetUser] = await pool.query('SELECT role_id, created_by FROM users WHERE id = ?', [id]);
        if (targetUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Solo Super Admin puede cambiar roles o estado de cualquier usuario
        if (updaterRole !== 1) {
            // Gym Owner y Trainer solo pueden cambiar datos de usuarios que crearon
            if (targetUser[0].created_by !== updaterId) {
                return res.status(403).json({ message: 'Unauthorized to update this user' });
            }
        }

        // Construir query dinámicamente
        let updateFields = [];
        let updateValues = [];

        if (first_name !== undefined) {
            updateFields.push('first_name = ?');
            updateValues.push(first_name);
        }
        if (last_name !== undefined) {
            updateFields.push('last_name = ?');
            updateValues.push(last_name);
        }
        if (bio !== undefined) {
            updateFields.push('bio = ?');
            updateValues.push(bio);
        }

        // Solo Super Admin o el creador puede cambiar el estado
        if (is_active !== undefined && (updaterRole === 1 || targetUser[0].created_by === updaterId)) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }

        // Solo Super Admin puede cambiar roles
        if (role_id !== undefined && updaterRole === 1) {
            updateFields.push('role_id = ?');
            updateValues.push(role_id);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        updateValues.push(id);

        await pool.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
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
