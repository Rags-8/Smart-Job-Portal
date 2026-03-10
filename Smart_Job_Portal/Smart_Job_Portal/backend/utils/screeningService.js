const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TECH_KEYWORDS = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 'postgresql', 'mysql', 'sql',
    'html', 'css', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'github', 'agile', 'scrum', 'rest', 'api',
    'redux', 'next.js', 'django', 'flask', 'spring', 'hibernate', 'php', 'laravel', 'vue', 'angular', 'svelte',
    'fastapi', 'nest', 'redis', 'elasticsearch', 'kafka', 'graphql', 'tailwind', 'bootstrap', 'sass', 'less',
    'tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy', 'opencv', 'nlp', 'data science', 'machine learning',
    'deep learning', 'tableau', 'power bi', 'excel', 'word', 'powerpoint', 'cpp', 'c#', 'dotnet', 'flutter',
    'react native', 'ios', 'android', 'kotlin', 'swift', 'unity', 'unreal', 'blender', 'figma', 'canva', 'ui', 'ux',
    'web', 'app', 'application', 'mobile', 'frontend', 'backend', 'fullstack', 'software', 'engineer', 'developer',
    'node.js', 'rest api', 'graphql', 'nextjs', 'typescript', 'javascript', 'coding', 'programming'
];

/**
 * Simple local scoring fallback when AI is unavailable.
 */
function localEvaluate(job, app) {
    console.log("Using Robust Local Screening...");
    const requirements = ((job.requirements || "") + " " + (job.description || "")).toLowerCase();
    const skills = (app.skills || "").toLowerCase();
    const skillsRequired = Array.isArray(job.skills_required) ? job.skills_required.map(s => s.toLowerCase()) : [];

    // Filter TECH_KEYWORDS that are present in job requirements/description
    const techFromText = TECH_KEYWORDS.filter(k =>
        requirements.includes(k)
    );

    // Combine with explicit skills_required array
    const allRequiredTech = [...new Set([...techFromText, ...skillsRequired])];

    if (allRequiredTech.length === 0) {
        // Fallback to checking for common words if no tech keywords found
        const commonWords = requirements.split(/[\s,]+/).filter(w => w.length > 4);
        const match = commonWords.filter(w => skills.includes(w));
        console.log("No explicit tech keywords found. Generic match:", match);
        const score = Math.min(100, (match.length / Math.max(1, commonWords.length)) * 100 + 40);
        return {
            match_percentage: Math.round(score),
            matched_skills: match.slice(0, 5),
            missing_skills: commonWords.filter(w => !skills.includes(w)).slice(0, 5),
            fit_level: score >= 70 ? "Good Fit (Local)" : "Partial Fit (Local)",
            logic_explanation: "Evaluated using generic keyword matching."
        };
    }

    const matchedTech = allRequiredTech.filter(k => skills.includes(k));
    console.log("All Required Tech:", allRequiredTech);
    console.log("Matched Tech Keywords:", matchedTech);
    const missingTech = allRequiredTech.filter(k => !skills.includes(k));

    // Calculate score based on matched tech vs required tech
    // Give a base 30% and scale the rest
    const baseScore = (matchedTech.length / allRequiredTech.length) * 70 + 30;

    // Bonus for experience if mentioned
    const experienceBonus = app.experience && (app.experience.toLowerCase().includes('year') || parseInt(app.experience) > 0) ? 10 : 0;
    const finalScore = Math.max(15, Math.min(100, baseScore + experienceBonus));

    return {
        match_percentage: Math.round(finalScore),
        matched_skills: matchedTech,
        missing_skills: missingTech.slice(0, 5),
        fit_level: finalScore >= 80 ? "Excellent Fit (Local)" : (finalScore >= 60 ? "Good Fit (Local)" : "Partial Fit (Local)"),
        logic_explanation: `Matched ${matchedTech.length} out of ${allRequiredTech.length} key technical requirements.`
    };
}

/**
 * Automatically evaluates an application using AI and updates its status.
 * @param {string} applicationId 
 * @param {string} jobId 
 */
async function evaluateApplication(applicationId, jobId) {
    try {
        console.log(`Starting AI screening for Application: ${applicationId}, Job: ${jobId}`);

        // 1. Fetch Job and Application Details
        const jobQuery = 'SELECT title, description, requirements, skills_required FROM jobs WHERE id = $1';
        const appQuery = 'SELECT full_name, skills, experience, resume_url FROM applications WHERE id = $1';

        const [jobRes, appRes] = await Promise.all([
            db.query(jobQuery, [jobId]),
            db.query(appQuery, [applicationId])
        ]);

        if (jobRes.rows.length === 0 || appRes.rows.length === 0) {
            console.error('Job or Application not found for screening');
            return;
        }

        const job = jobRes.rows[0];
        const app = appRes.rows[0];

        let parsedData;

        try {
            // 2. Prepare AI Prompt
            const prompt = `
            Compare the following Candidate's details against the Job Requirements.
            
            Candidate Name: ${app.full_name}
            Candidate Skills: ${app.skills}
            Candidate Experience: ${app.experience}
            Resume Text/Info: ${app.resume_url}
            
            Job Title: ${job.title}
            Job Description: ${job.description}
            Job Requirements: ${job.requirements || 'Contact employer for requirements'}
            
            Return ONLY a JSON object with these keys:
            - match_percentage (int 0-100)
            - matched_skills (array of strings)
            - missing_skills (array of strings)
            - fit_level (string: "Excellent Fit", "Good Fit", "Partial Fit", "Not a Fit")
            - logic_explanation (string: short explanation of the score)
            
            Do not use markdown wrappers around the JSON.
            `;

            // 3. Call Gemini
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent(prompt);
            const aiResponse = await result.response.text();

            parsedData = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim());
            console.log("AI Screening result obtained via Gemini.");
        } catch (aiError) {
            console.warn("Gemini AI failed, using local fallback:", aiError.message);
            parsedData = localEvaluate(job, app);
        }

        const score = parsedData.match_percentage || 0;
        const status = score >= 70 ? 'Selected' : 'Rejected';

        // 4. Update Application Status and sync AI Match Score
        await db.query('UPDATE applications SET status = $1, ai_match_score = $2 WHERE id = $3', [status, score, applicationId]);

        // 5. Store Match Results
        await db.query(`
            INSERT INTO job_match_results (application_id, match_percentage, matched_skills, missing_skills, fit_level)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (application_id) 
            DO UPDATE SET 
                match_percentage = EXCLUDED.match_percentage,
                matched_skills = EXCLUDED.matched_skills,
                missing_skills = EXCLUDED.missing_skills,
                fit_level = EXCLUDED.fit_level
        `, [
            applicationId,
            score,
            parsedData.matched_skills || [],
            parsedData.missing_skills || [],
            parsedData.fit_level || 'Not Evaluated'
        ]);

        console.log(`Screening Complete. Score: ${score}%, Status: ${status}`);

    } catch (error) {
        console.error('Error during automated screening:', error);
    }
}

module.exports = { evaluateApplication, localEvaluate };
