require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function upgradeDB() {
    try {
        await client.connect();
        console.log("Connected to database for email upgrade.");

        // Add email_sent column to applications
        await client.query(`
            ALTER TABLE applications 
            ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
        `);
        console.log("Added email_sent column to applications table.");

        // Add ai_match_score column to applications to optionally save the score
        await client.query(`
            ALTER TABLE applications 
            ADD COLUMN IF NOT EXISTS ai_match_score INTEGER DEFAULT NULL;
        `);
        console.log("Added ai_match_score column to applications table.");

    } catch (error) {
        console.error("Error upgrading database:", error);
    } finally {
        await client.end();
    }
}

upgradeDB();
