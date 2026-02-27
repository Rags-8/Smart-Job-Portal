const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log("Starting database migration...");
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        console.log("Upgrading jobs table...");
        await client.query(`
            ALTER TABLE jobs
            ADD COLUMN IF NOT EXISTS company_name TEXT,
            ADD COLUMN IF NOT EXISTS company_website TEXT,
            ADD COLUMN IF NOT EXISTS company_description TEXT,
            ADD COLUMN IF NOT EXISTS experience_required TEXT,
            ADD COLUMN IF NOT EXISTS skills_required TEXT[],
            ADD COLUMN IF NOT EXISTS number_of_openings INTEGER,
            ADD COLUMN IF NOT EXISTS application_last_date TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS responsibilities TEXT,
            ADD COLUMN IF NOT EXISTS requirements TEXT,
            ADD COLUMN IF NOT EXISTS benefits TEXT;
        `);

        // Set default values for existing rows so they don't break the new UI which expects them
        await client.query(`
            UPDATE jobs
            SET 
                company_name = 'Unknown Company',
                experience_required = 'Not specified',
                number_of_openings = 1,
                application_last_date = NOW() + INTERVAL '30 days',
                responsibilities = 'Not specified',
                requirements = 'Not specified'
            WHERE company_name IS NULL;
        `);

        console.log("Upgrading applications table...");
        await client.query(`
            ALTER TABLE applications
            ADD COLUMN IF NOT EXISTS full_name TEXT,
            ADD COLUMN IF NOT EXISTS email TEXT,
            ADD COLUMN IF NOT EXISTS phone_number TEXT,
            ADD COLUMN IF NOT EXISTS skills TEXT,
            ADD COLUMN IF NOT EXISTS experience TEXT,
            ADD COLUMN IF NOT EXISTS resume_url TEXT,
            ADD COLUMN IF NOT EXISTS github_url TEXT,
            ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
        `);

        // Update default status for existing and ensure valid state
        await client.query(`
            UPDATE applications
            SET 
                full_name = 'Existing User',
                email = 'unknown@example.com',
                phone_number = 'N/A',
                skills = 'N/A',
                experience = 'N/A',
                github_url = '',
                linkedin_url = ''
            WHERE full_name IS NULL;
        `);

        await client.query('COMMIT');
        console.log("Migration completed successfully!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration failed:", e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
