const pool = require('../config/database');

const getAllGyms = async (req, res) => {
    try {
        const { role_id, id: userId } = req.user;
        let query = 'SELECT DISTINCT g.* FROM gyms g';
        let params = [];

        // RBAC: Gym Owner solo ve sus gyms asignados
        if (role_id === 2) { // Gym Owner
            query += ' INNER JOIN gym_owners go ON g.id = go.gym_id WHERE go.owner_id = ?';
            params.push(userId);
        }
        // Super Admin ve todos (sin filtro adicional)

        query += ' ORDER BY g.name ASC';

        const [gyms] = await pool.query(query, params);
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving gyms', error: error.message });
    }
};

const getGymById = async (req, res) => {
    const { id } = req.params;
    try {
        const [gyms] = await pool.query(`
            SELECT g.*, go.owner_id, 
                   u.first_name as owner_first_name, 
                   u.last_name as owner_last_name,
                   u.email as owner_email
            FROM gyms g
            LEFT JOIN gym_owners go ON g.id = go.gym_id
            LEFT JOIN users u ON go.owner_id = u.id
            WHERE g.id = ?
        `, [id]);

        if (gyms.length === 0) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        res.json(gyms[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving gym', error: error.message });
    }
};

const createGym = async (req, res) => {
    const { name, address, phone, logo_url, owner_id } = req.body;
    const { role_id } = req.user;

    // RBAC: Only Super Admin (1) can create gyms
    if (role_id !== 1) {
        return res.status(403).json({ message: 'Unauthorized. Only Super Admin can create gyms.' });
    }

    // Validación: owner_id es obligatorio
    if (!owner_id) {
        return res.status(400).json({ message: 'Gym owner is required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Crear el gym
        const [result] = await connection.query(
            'INSERT INTO gyms (name, address, phone, logo_url) VALUES (?, ?, ?, ?)',
            [name, address, phone, logo_url]
        );

        const gymId = result.insertId;

        // 2. Asignar el owner
        await connection.query(
            'INSERT INTO gym_owners (gym_id, owner_id) VALUES (?, ?)',
            [gymId, owner_id]
        );

        await connection.commit();
        res.status(201).json({ message: 'Gym created', gymId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error creating gym', error: error.message });
    } finally {
        connection.release();
    }
};

const updateGym = async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, logo_url, owner_id } = req.body;
    const { role_id } = req.user;

    if (role_id !== 1) {
        return res.status(403).json({ message: 'Unauthorized. Only Super Admin can update gyms.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Actualizar datos del gym
        await connection.query(
            'UPDATE gyms SET name = ?, address = ?, phone = ?, logo_url = ? WHERE id = ?',
            [name, address, phone, logo_url, id]
        );

        // Si se proporciona owner_id, actualizar la asignación
        if (owner_id) {
            // Verificar si ya existe una asignación
            const [existing] = await connection.query(
                'SELECT id FROM gym_owners WHERE gym_id = ?',
                [id]
            );

            if (existing.length > 0) {
                // Actualizar el owner existente
                await connection.query(
                    'UPDATE gym_owners SET owner_id = ? WHERE gym_id = ?',
                    [owner_id, id]
                );
            } else {
                // Crear nueva asignación
                await connection.query(
                    'INSERT INTO gym_owners (gym_id, owner_id) VALUES (?, ?)',
                    [id, owner_id]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Gym updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error updating gym', error: error.message });
    } finally {
        connection.release();
    }
};

const deleteGym = async (req, res) => {
    const { id } = req.params;
    const { role_id } = req.user;

    if (role_id !== 1) {
        return res.status(403).json({ message: 'Unauthorized. Only Super Admin can delete gyms.' });
    }

    try {
        // Check if gym has users
        const [users] = await pool.query('SELECT id FROM users WHERE gym_id = ?', [id]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'Cannot delete gym with associated users. Reassign or delete users first.' });
        }

        await pool.query('DELETE FROM gyms WHERE id = ?', [id]);
        res.json({ message: 'Gym deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting gym', error: error.message });
    }
};

const getAvailableOwners = async (req, res) => {
    try {
        const [owners] = await pool.query(`
            SELECT id, email, first_name, last_name 
            FROM users 
            WHERE role_id = 2 AND is_active = TRUE
            ORDER BY first_name ASC
        `);
        res.json(owners);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving owners', error: error.message });
    }
};

module.exports = { getAllGyms, getGymById, createGym, updateGym, deleteGym, getAvailableOwners };
