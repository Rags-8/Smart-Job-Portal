const db = require('./db');
const { evaluateApplication } = require('./utils/screeningService');

async function catchUp() {
    try {
        console.log("--- STARTING CATCH-UP SCREENING ---");

        // Find applications that don't have a match result yet
        const { rows: pendingApps } = await db.query(`
            SELECT a.id, a.job_id, a.full_name 
            FROM applications a
            LEFT JOIN job_match_results jmr ON a.id = jmr.application_id
            WHERE jmr.application_id IS NULL OR jmr.match_percentage = 30
        `);

        console.log(`Found ${pendingApps.length} applications to screen.`);

        let count = 0;
        for (const app of pendingApps) {
            count++;
            console.log(`[${count}/${pendingApps.length}] Processing: ${app.full_name} (${app.id})`);
            try {
                await evaluateApplication(app.id, app.job_id);
            } catch (err) {
                console.error(`Failed to process ${app.id}:`, err);
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("--- CATCH-UP SCREENING COMPLETE ---");
        process.exit(0);
    } catch (error) {
        console.error("Catch-up failed:", error);
        process.exit(1);
    }
}

catchUp();
