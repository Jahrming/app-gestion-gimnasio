const pool = require('../src/config/database');

async function addCreatedByField() {
    const connection = await pool.getConnection();

    try {
        console.log('✨ Starting migration: Adding created_by field to users table...\n');

        // Check if column already exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'created_by'
        `);

        if (columns.length > 0) {
            console.log('ℹ️  Column created_by already exists, skipping...');
            return;
        }

        // Add created_by column
        console.log('📝 Adding created_by column...');
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN created_by INT AFTER gym_id
        `);
        console.log('✅ Column created_by added');

        // Add foreign key
        console.log('🔗 Adding foreign key constraint...');
        await connection.query(`
            ALTER TABLE users 
            ADD CONSTRAINT fk_users_created_by 
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        `);
        console.log('✅ Foreign key constraint added');

        // Add index
        console.log('📊 Creating index on created_by...');
        await connection.query(`
            CREATE INDEX idx_created_by ON users(created_by)
        `);
        console.log('✅ Index created');

        console.log('\n🎉 Migration completed successfully!');
        console.log('ℹ️  Note: Existing users will have created_by = NULL');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}

// Execute migration
addCreatedByField()
    .then(() => {
        console.log('\n✅ Migration script finished');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Migration error:', err);
        process.exit(1);
    });
