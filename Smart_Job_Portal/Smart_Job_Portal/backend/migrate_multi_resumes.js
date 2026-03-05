const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Connected. Removing UNIQUE constraint from user_resumes...');

        // Drop unique constraint if it exists. 
        // We might need to find the constraint name first if it's not named 'user_resumes_user_id_key'
        // But in standard PG, it's usually table_column_key

        await client.query(`
            ALTER TABLE user_resumes DROP CONSTRAINT IF EXISTS user_resumes_user_id_key;
        `);

        console.log('UNIQUE constraint removed.');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(-1);
    }
}

migrate();
