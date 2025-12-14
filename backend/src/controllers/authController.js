const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { email, password, first_name, last_name, role_id, gym_id } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // In a real app, hash password here (e.g., bcrypt)
        const password_hash = password; // Placeholder for hashing

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role_id, gym_id) VALUES (?, ?, ?, ?, ?, ?)',
            [email, password_hash, first_name, last_name, role_id || 4, gym_id] // Default role 4 (client)
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password (placeholder)
        if (user.password_hash !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id, gym_id: user.gym_id },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role_id: user.role_id,
                gym_id: user.gym_id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login };
