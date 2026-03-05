const db = require('./db');
require('dotenv').config();

async function checkJobs() {
    try {
        console.log("Checking all jobs and their admins...");
        const res = await db.query('SELECT id, title, admin_id FROM jobs');
        console.table(res.rows);

        console.log("\nChecking last 5 applications...");
        const appRes = await db.query('SELECT id, job_id, full_name, status FROM applications ORDER BY applied_at DESC LIMIT 5');
        console.table(appRes.rows);

        console.log("\nChecking for admin users...");
        const userRes = await db.query("SELECT id, name, email, role FROM users WHERE role = 'admin'");
        console.table(userRes.rows);

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        process.exit();
    }
}

checkJobs();
