require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3307,
    multipleStatements: true
};

const SEED_USERS = [
    {
        email: 'admin@gym.com',
        password: 'admin123', // In real app, hash this!
        first_name: 'Super',
        last_name: 'Admin',
        role_id: 1 // super_admin
    },
    {
        email: 'owner@gym.com',
        password: 'owner123',
        first_name: 'John',
        last_name: 'Owner',
        role_id: 2 // gym_owner
    },
    {
        email: 'trainer@gym.com',
        password: 'trainer123',
        first_name: 'Mike',
        last_name: 'Trainer',
        role_id: 3 // trainer
    },
    {
        email: 'user@gym.com',
        password: 'user123',
        first_name: 'Sarah',
        last_name: 'Client',
        role_id: 4 // client
    }
];

async function setupDatabase() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection(DB_CONFIG);

        console.log('🔨 Creating database gym_db if not exists...');
        await connection.query('CREATE DATABASE IF NOT EXISTS gym_db');
        await connection.query('USE gym_db');

        console.log('📄 Reading schema.sql...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Executing schema...');
        await connection.query(schemaSql);

        console.log('🌱 Seeding users...');
        for (const user of SEED_USERS) {
            // Check if user exists
            const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [user.email]);
            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO users (email, password_hash, first_name, last_name, role_id) VALUES (?, ?, ?, ?, ?)',
                    [user.email, user.password, user.first_name, user.last_name, user.role_id]
                );
                console.log(`   ✅ Created user: ${user.email} (${user.password})`);
            } else {
                console.log(`   ⚠️ User ${user.email} already exists`);
            }
        }

        console.log('✨ Database setup completed successfully!');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
