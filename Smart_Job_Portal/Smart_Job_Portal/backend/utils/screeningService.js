const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Automatically evaluates an application using AI and updates its status.
 * @param {string} applicationId 
 * @param {string} jobId 
 */
async function evaluateApplication(applicationId, jobId) {
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

        const job = jobRes.rows[0];
        const app = appRes.rows[0];

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

        let parsedData;
        try {
            parsedData = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) {
            console.error("AI JSON Parse Error:", e, aiResponse);
            return;
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
        console.error('Error during automated AI screening:', error);
    }
}

module.exports = { evaluateApplication };
