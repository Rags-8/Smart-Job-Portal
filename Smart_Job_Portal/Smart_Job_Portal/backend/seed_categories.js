require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const categoryMap = [
    { category: 'Software', keywords: ['software', 'developer', 'engineer', 'backend', 'frontend', 'fullstack', 'full stack', 'react', 'node', 'python', 'java', 'devops', 'cloud', 'data', 'ml', 'ai', 'machine learning', 'cybersecurity', 'security', 'mobile', 'android', 'ios', 'analyst'] },
    { category: 'Designing', keywords: ['design', 'ui', 'ux', 'graphic', 'figma', 'creative', 'visual', 'illustrator', 'photoshop', 'motion'] },
    { category: 'Product', keywords: ['product manager', 'product owner', 'product analyst', 'scrum', 'agile', 'roadmap', 'product'] },
    { category: 'Marketing', keywords: ['marketing', 'seo', 'sem', 'content', 'social media', 'brand', 'digital marketing', 'growth', 'copywriter', 'email marketing'] },
    { category: 'Sales', keywords: ['sales', 'business development', 'account manager', 'b2b', 'b2c', 'revenue'] },
    { category: 'Finance', keywords: ['finance', 'accounting', 'accountant', 'tax', 'audit', 'financial', 'investment', 'banking'] },
    { category: 'Healthcare', keywords: ['health', 'medical', 'doctor', 'nurse', 'pharma', 'clinical', 'hospital', 'biotech'] },
    { category: 'Education', keywords: ['teacher', 'tutor', 'education', 'instructor', 'trainer', 'academic', 'professor'] },
    { category: 'Customer Service', keywords: ['customer support', 'customer service', 'helpdesk', 'support', 'call center', 'customer success'] },
    { category: 'Hardware', keywords: ['hardware', 'embedded', 'iot', 'pcb', 'electronics', 'vlsi', 'firmware', 'circuit'] },
];

function guessCategory(title, skills) {
    const text = (title + ' ' + (Array.isArray(skills) ? skills.join(' ') : (skills || ''))).toLowerCase();
    for (const { category, keywords } of categoryMap) {
        if (keywords.some(kw => text.includes(kw))) return category;
    }
    return 'Software';
}

async function run() {
    const { rows } = await pool.query('SELECT id, title, skills_required FROM jobs WHERE category IS NULL');
    console.log(`Found ${rows.length} jobs with null category`);
    for (const job of rows) {
        const cat = guessCategory(job.title, job.skills_required);
        await pool.query('UPDATE jobs SET category = $1 WHERE id = $2', [cat, job.id]);
        console.log(`  ✓ "${job.title}" → ${cat}`);
    }
    console.log('Done!');
    pool.end();
}

run().catch(err => { console.error(err.message); pool.end(); });
