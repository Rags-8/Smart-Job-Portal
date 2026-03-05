const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Connected. Adding category column to jobs table...');

        await client.query(`
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;
        `);

        console.log('Category column added.');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(-1);
    }
}

migrate();
