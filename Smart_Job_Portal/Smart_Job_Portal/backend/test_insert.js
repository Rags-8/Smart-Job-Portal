const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        const client = await pool.connect();
        const userRes = await client.query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log('No users');
            process.exit(0);
        }
        const userId = userRes.rows[0].id;
        console.log('Using userId:', userId);

        const resumeData = { test: 'data', time: new Date() };
        const insertRes = await client.query(`
            INSERT INTO user_resumes (user_id, resume_data, updated_at)
            VALUES ($1, $2, NOW())
            RETURNING id
        `, [userId, resumeData]);

        console.log('Inserted ID:', insertRes.rows[0].id);

        const countRes = await client.query('SELECT COUNT(*) FROM user_resumes');
        console.log('New Total:', countRes.rows[0].count);

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(-1);
    }
}

test();
