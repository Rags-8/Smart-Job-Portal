require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        await client.connect();
        console.log("SUCCESS");
    } catch (err) {
        console.error("FAIL:", err.message);
    } finally {
        await client.end();
    }
}

testConnection();
