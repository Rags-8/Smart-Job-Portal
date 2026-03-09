const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Automatically evaluates an application using AI and updates its status.
 * @param {string} applicationId 
 * @param {string} jobId 
 */
/**
 * Extract keywords/skills from a string or array.
 */
function extractSkills(text) {
    if (!text) return [];
    if (Array.isArray(text)) return text;
    // Basic comma-separated or space-separated cleanup
    return text.toLowerCase().split(/[,\n ]+/).map(s => s.trim()).filter(s => s.length > 2);
}

/**
 * Fallback scoring logic in case AI fails (leaked key, quota, etc.)
 */
function calculateFallbackScore(job, app) {
    const jobText = (job.requirements + " " + job.description + " " + job.title).toLowerCase();
    const appSkills = extractSkills(app.skills);
    
    let matched = [];
    let missing = [];
    
    appSkills.forEach(skill => {
        if (jobText.includes(skill.toLowerCase())) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    });

    const score = appSkills.length > 0 ? Math.round((matched.length / appSkills.length) * 100) : 50;
    
    return {
        match_percentage: score,
        matched_skills: matched.slice(0, 10),
        missing_skills: missing.slice(0, 10),
        fit_level: (score >= 80 ? "Excellent Fit" : score >= 60 ? "Good Fit" : score >= 40 ? "Partial Fit" : "Not a Fit") + " (Fallback)",
        logic_explanation: "Automated screening based on keyword matching (AI fallback logic used)."
    };
}

/**
 * Automatically evaluates an application using AI and updates its status.
 * @param {string} applicationId 
 * @param {string} jobId 
 */
async function evaluateApplication(applicationId, jobId) {
    let parsedData = null;
    let app = null;
    let job = null;
    
    try {
        console.log(`Starting AI screening for Application: ${applicationId}, Job: ${jobId}`);

        // 1. Fetch Job and Application Details
        const jobQuery = 'SELECT title, description, requirements FROM jobs WHERE id = $1';
        const appQuery = 'SELECT full_name, skills, experience, resume_url FROM applications WHERE id = $1';

        const [jobRes, appRes] = await Promise.all([
            db.query(jobQuery, [jobId]),
            db.query(appQuery, [applicationId])
        ]);

        if (jobRes.rows.length === 0 || appRes.rows.length === 0) {
            console.error('Job or Application not found for screening');
            return;
        }

        job = jobRes.rows[0];
        app = appRes.rows[0];

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
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const aiResponse = await result.response.text();

            console.log("AI Response Received.");
            
            // Extraction logic with regex for robustness
            const jsonText = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonText) {
                parsedData = JSON.parse(jsonText[0]);
            } else {
                throw new Error("No JSON found in AI response");
            }
        } catch (aiError) {
            console.error('AI Processing Error (Check API Key/Quota):', aiError.message);
            // Fallback strategy
            console.log("Using keyword-based fallback scoring.");
            parsedData = calculateFallbackScore(job, app);
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

        console.log(`AI Screening Complete. Score: ${score}%, Status: ${status}`);

    } catch (error) {
        console.error('Critical error during automated AI screening:', error);
    }
}

module.exports = { evaluateApplication };
