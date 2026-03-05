const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT user_id, id, updated_at FROM user_resumes');
        console.log('Results:', JSON.stringify(res.rows, null, 2));

        const users = await client.query('SELECT id, email FROM users');
        console.log('Users:', JSON.stringify(users.rows, null, 2));

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(-1);
    }
}

check();
