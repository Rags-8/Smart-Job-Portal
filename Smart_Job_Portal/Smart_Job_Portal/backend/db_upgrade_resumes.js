const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function upgrade() {
    try {
        const client = await pool.connect();
        console.log('Connected. Creating user_resumes table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS user_resumes (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        resume_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);

        console.log('user_resumes table ready.');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(-1);
    }
}

upgrade();
