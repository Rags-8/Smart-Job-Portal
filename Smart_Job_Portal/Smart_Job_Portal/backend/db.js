const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL directly from .env — this connects to Supabase direct connection (no session pooler)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Increase max connections
  connectionTimeoutMillis: 10000, // 10 seconds timeout for new connections
  query_timeout: 30000, // 30 seconds timeout for queries
  idleTimeoutMillis: 30000 // 30 seconds before closing idle clients
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function connect() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database (Supabase)');
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL database:', err.message);
    console.error('   DATABASE_URL used:', connectionString ? connectionString.replace(/:([^:@]+)@/, ':****@') : 'undefined');
    console.error('   → Ensure DATABASE_URL is set correctly in your .env file');
    console.error('     Format: postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres');
  }
}

connect();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
