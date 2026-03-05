const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function describe() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_resumes'
            ORDER BY ordinal_position
        `);
        console.log('--- TABLE SCHEMA: user_resumes ---');
        res.rows.forEach(row => {
            console.log(`${row.column_name.padEnd(20)} | ${row.data_type}`);
        });

        const countRes = await client.query('SELECT COUNT(*) FROM user_resumes');
        console.log('--- DATA COUNT ---');
        console.log('Total Rows:', countRes.rows[0].count);

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(-1);
    }
}

describe();
