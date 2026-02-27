require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runInit() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database");

    // Drop existing tables to start fresh matching the exact schema
    await client.query(`
        DROP TABLE IF EXISTS job_match_results CASCADE;
        DROP TABLE IF EXISTS skill_gaps CASCADE;
        DROP TABLE IF EXISTS recommendations CASCADE;
        DROP TABLE IF EXISTS resume_analysis CASCADE;
        DROP TABLE IF EXISTS resumes CASCADE;
        DROP TABLE IF EXISTS applications CASCADE;
        DROP TABLE IF EXISTS jobs CASCADE;
        DROP TABLE IF EXISTS companies CASCADE;
        DROP TABLE IF EXISTS users_info CASCADE;
        DROP TABLE IF EXISTS profiles CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
    `);

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 1. Users Table
    await client.query(`
    CREATE TABLE users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK (role IN ('user', 'admin')) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );`);

    // 2. Jobs Table
    await client.query(`
    CREATE TABLE jobs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title TEXT NOT NULL,
        location TEXT NOT NULL,
        salary TEXT NOT NULL,
        job_type TEXT NOT NULL,
        description TEXT NOT NULL,
        admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );`);

    // 3. Applications Table
    await client.query(`
    CREATE TABLE applications (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'applied',
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );`);

    console.log("SQL executed successfully! Fresh schema matched.");

  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

runInit();
