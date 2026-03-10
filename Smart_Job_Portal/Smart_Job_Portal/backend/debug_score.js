const db = require('./db');

async function debug() {
    const appId = 'cb842b36-03da-4e9e-926d-eb1616b1e63f';
    const jobId = 'caeadfe3-f991-4ba5-80c6-729413f8a59a';

    const { rows: jobs } = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    const { rows: apps } = await db.query('SELECT * FROM applications WHERE id = $1', [appId]);

    console.log('--- JOB ---');
    console.log('Title:', jobs[0].title);
    console.log('Requirements:', jobs[0].requirements);
    console.log('Description:', jobs[0].description);

    console.log('\n--- APPLICATION ---');
    console.log('Full Name:', apps[0].full_name);
    console.log('Skills:', apps[0].skills);
    console.log('Experience:', apps[0].experience);

    process.exit(0);
}

debug();
