require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to db...');
        const client = await pool.connect();
        console.log('Creating user_resumes table if not exists...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS user_resumes (
          user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          resume_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);

        console.log('Table user_resumes created or already exists.');

        const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
        console.log('Tables:', result.rows.map(r => r.table_name));

        client.release();
        pool.end();
    } catch (e) {
        console.error('Error:', e);
        pool.end();
    }
}

run();
