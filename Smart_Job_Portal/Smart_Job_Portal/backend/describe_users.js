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
            SELECT table_schema, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY table_schema, ordinal_position
        `);
        console.log('--- TABLE SCHEMA: users ---');
        res.rows.forEach(row => {
            console.log(`${row.table_schema.padEnd(15)} | ${row.column_name.padEnd(20)} | ${row.data_type}`);
        });
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(-1);
    }
}

describe();
