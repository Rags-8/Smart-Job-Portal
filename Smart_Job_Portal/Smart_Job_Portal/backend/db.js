const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL directly from .env — this connects to Supabase direct connection (no session pooler)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
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
