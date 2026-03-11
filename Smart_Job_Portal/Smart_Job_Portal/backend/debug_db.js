const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function debug() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        // Get the latest application
        const appRes = await client.query(`
      SELECT a.*, r.resume_data 
      FROM applications a
      LEFT JOIN resumes r ON (a.resume_url LIKE 'saved:' || r.id || ':%' OR a.resume_url = r.id::text)
      ORDER BY a.applied_at DESC
      LIMIT 1
    `);

        if (appRes.rows.length === 0) {
            console.log('No applications found');
            return;
        }

        const app = appRes.rows[0];
        console.log('--- LATEST APPLICATION ---');
        console.log('ID:', app.id);
        console.log('Full Name:', app.full_name);
        console.log('Skills Field:', app.skills);
        console.log('Resume URL (Text):', app.resume_url.substring(0, 500) + '...');

        // Check match result
        const matchRes = await client.query('SELECT * FROM job_match_results WHERE application_id = $1', [app.id]);
        console.log('\n--- MATCH RESULT ---');
        console.log(matchRes.rows[0]);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

debug();
