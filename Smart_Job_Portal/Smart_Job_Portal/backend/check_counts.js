const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const client = await pool.connect();

        const appCount = await client.query('SELECT COUNT(*) FROM applications');
        console.log('Applications Count:', appCount.rows[0].count);

        const matchCount = await client.query('SELECT COUNT(*) FROM job_match_results');
        console.log('Job Match Results Count:', matchCount.rows[0].count);

        if (appCount.rows[0].count > 0) {
            const lastApps = await client.query('SELECT id, status, applied_at FROM applications ORDER BY applied_at DESC LIMIT 5');
            console.log('Last 5 Applications:', JSON.stringify(lastApps.rows, null, 2));
        }

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(-1);
    }
}

check();
