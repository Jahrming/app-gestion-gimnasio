const pool = require('../config/database');

const getAllGyms = async (req, res) => {
    try {
        const [gyms] = await pool.query('SELECT * FROM gyms');
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving gyms', error: error.message });
    }
};

const getGymById = async (req, res) => {
    const { id } = req.params;
    try {
        const [gyms] = await pool.query('SELECT * FROM gyms WHERE id = ?', [id]);
        if (gyms.length === 0) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        res.json(gyms[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving gym', error: error.message });
    }
};

const createGym = async (req, res) => {
    const { name, address, phone, logo_url } = req.body;
    const { role_id } = req.user;

    // RBAC: Only Super Admin (1) can create gyms
    if (role_id !== 1) {
        return res.status(403).json({ message: 'Unauthorized. Only Super Admin can create gyms.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO gyms (name, address, phone, logo_url) VALUES (?, ?, ?, ?)',
            [name, address, phone, logo_url]
        );
        res.status(201).json({ message: 'Gym created', gymId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating gym', error: error.message });
    }
};

const updateGym = async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, logo_url } = req.body;
    const { role_id } = req.user;

    if (role_id !== 1) {
        return res.status(403).json({ message: 'Unauthorized. Only Super Admin can update gyms.' });
    }

    try {
        await pool.query(
            'UPDATE gyms SET name = ?, address = ?, phone = ?, logo_url = ? WHERE id = ?',
            [name, address, phone, logo_url, id]
        );
        res.json({ message: 'Gym updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating gym', error: error.message });
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

module.exports = { getAllGyms, getGymById, createGym, updateGym, deleteGym };
