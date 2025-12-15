const pool = require('../src/config/database');

async function migrateGymOwners() {
    const connection = await pool.getConnection();

    try {
        console.log('Creating gym_owners table...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS gym_owners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                gym_id INT NOT NULL,
                owner_id INT NOT NULL,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_gym_owner (gym_id)
            )
        `);

        console.log('Creating index on owner_id...');
        await connection.query(`
            CREATE INDEX IF NOT EXISTS idx_owner_id ON gym_owners(owner_id)
        `);

        console.log('✅ gym_owners table created successfully');

        // Asignar gyms existentes al primer gym owner encontrado
        const [owners] = await connection.query(
            'SELECT id FROM users WHERE role_id = 2 AND is_active = TRUE LIMIT 1'
        );

        if (owners.length > 0) {
            const ownerId = owners[0].id;

            const [gyms] = await connection.query('SELECT id FROM gyms');

            for (const gym of gyms) {
                await connection.query(
                    'INSERT IGNORE INTO gym_owners (gym_id, owner_id) VALUES (?, ?)',
                    [gym.id, ownerId]
                );
            }

            console.log(`✅ Assigned ${gyms.length} gyms to owner ${ownerId}`);
        } else {
            console.log('⚠️ No gym owners found. Please create a gym owner user first.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        connection.release();
    }
}

migrateGymOwners()
    .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration error:', err);
        process.exit(1);
    });
