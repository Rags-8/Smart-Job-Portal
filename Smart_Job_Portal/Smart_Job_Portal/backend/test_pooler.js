const { Pool } = require('pg');

const ref = 'agjelwgurlnsucxzixba';
const pass = encodeURIComponent('R@gsgR__088');
const regions = ['ap-south-1', 'ap-southeast-1', 'ap-northeast-1', 'us-east-1', 'eu-central-1'];

// Try different username formats and both ports
const configs = [
  // Transaction pooler (port 6543) with postgres.ref format
  { user: `postgres.${ref}`, port: 6543, label: 'transaction pooler - postgres.ref' },
  // Session pooler (port 5432) with postgres.ref format
  { user: `postgres.${ref}`, port: 5432, label: 'session pooler - postgres.ref' },
  // Direct user format
  { user: 'postgres', port: 6543, label: 'transaction pooler - plain postgres user' },
];

async function test(region, cfg) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Testing [${cfg.label}] region: ${region} port: ${cfg.port}...`);
  const pool = new Pool({
    host,
    port: cfg.port,
    user: cfg.user,
    password: 'R@gsgR__088',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 6000
  });
  try {
    const client = await pool.connect();
    console.log(`  ✅ SUCCESS! Region: ${region}, Port: ${cfg.port}, User: ${cfg.user}`);
    client.release();
    await pool.end();
    return true;
  } catch(e) {
    console.log(`  ❌ FAIL (${region}): ${e.message.slice(0, 80)}`);
    await pool.end().catch(() => {});
    return false;
  }
}

(async () => {
  for (const cfg of configs) {
    for (const r of regions) {
      const ok = await test(r, cfg);
      if (ok) process.exit(0);
    }
  }
  console.log('\nAll combinations failed. Check Supabase dashboard for correct connection info.');
})();
