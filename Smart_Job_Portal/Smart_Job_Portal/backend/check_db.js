const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const client = await pool.connect();
        console.log('--- DB CHECK ---');

        const resCnt = await client.query('SELECT COUNT(*) FROM user_resumes');
        console.log('Total:', resCnt.rows[0].count);

        const resSample = await client.query('SELECT id, user_id, updated_at FROM user_resumes ORDER BY updated_at DESC LIMIT 2');
        console.log('Samples:', JSON.stringify(resSample.rows, null, 2));

        const resCons = await client.query(`
            SELECT conname, contype 
            FROM pg_constraint 
            WHERE conrelid = 'user_resumes'::regclass
        `);
        console.log('Constraints:', JSON.stringify(resCons.rows, null, 2));

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(-1);
    }
}

check();
