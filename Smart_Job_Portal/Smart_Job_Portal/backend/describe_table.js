const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function describe() {
    try {
        const tableName = process.argv[2] || 'user_resumes';
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position
        `, [tableName]);
        console.log(`--- TABLE SCHEMA: ${tableName} ---`);
        res.rows.forEach(row => {
            console.log(`${row.column_name.padEnd(20)} | ${row.data_type}`);
        });

        const countRes = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
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
