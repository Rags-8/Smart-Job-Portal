const { Pool } = require('pg');
require('dotenv').config();

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
  process.exit(-1);
});

async function connect() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL database', err);
  }
}

connect();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
