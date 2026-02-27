const express = require('express');
const router = express.Router();
const { verifyAuth } = require('./auth');
const supabase = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to call Gemini
async function analyzeWithGemini(prompt) {
    if (!process.env.GEMINI_API_KEY) return "AI Integration Unavailable. Please add GEMINI_API_KEY.";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Error analyzing with AI.";
    }
}

// 1. Resume Analysis Trigger
router.post('/analyze-resume', verifyAuth, async (req, res) => {
    try {
        const { resume_id } = req.body;

        // Fetch resume text
        const { data: resumes, error: resumeErr } = await supabase.from('resumes').select('*').eq('id', resume_id);
        if (resumeErr) throw resumeErr;
        if (!resumes || resumes.length === 0) throw new Error("Resume not found");
        const resume = resumes[0];

        const prompt = `
        Analyze this resume text and extract the following in simple bullet points or concise text:
        1. Skills (Comma separated list)
        2. Experience summary (Short paragraph)
        3. Education (Short paragraph)
        4. Projects (Short paragraph)
        5. Job Readiness Score (0-100)
        6. Tech Score (0-100)
        7. Projects Score (0-100)
        8. Communication Score (0-100)
        9. Structure Score (0-100)
        
        Resume Text: ${resume.parsed_text}
        
        Return ONLY a JSON object with strictly these exact keys: skills (array of strings), experience, education, projects, readiness_score (int), tech_score (int), projects_score (int), comm_score (int), structure_score (int). Do not use markdown wrappers around the JSON.
        `;

        const aiResponse = await analyzeWithGemini(prompt);
        let parsedData = {};
        try {
            parsedData = JSON.parse(aiResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, ''));
        } catch (e) {
            console.error("Could not parse AI JSON:", e, aiResponse);
            parsedData = { error: 'Failed to process AI output' };
        }

        // Store analysis
        const { data: analysis, error: analysisErr } = await supabase.from('resume_analysis')
            .insert([{
                resume_id,
                skills: parsedData.skills || [],
                experience: parsedData.experience || '',
                education: parsedData.education || '',
                projects: parsedData.projects || '',
                readiness_score: parsedData.readiness_score || 0,
                tech_score: parsedData.tech_score || 0,
                projects_score: parsedData.projects_score || 0,
                comm_score: parsedData.comm_score || 0,
                structure_score: parsedData.structure_score || 0
            }])
            .select('*');
        if (analysisErr) throw analysisErr;

        res.json(analysis[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 2. Job Matching
router.post('/match-job', verifyAuth, async (req, res) => {
    try {
        const { application_id, job_id, resume_id } = req.body;

        // Fetch Job Details
        const { data: jobs, error: jobErr } = await supabase.from('jobs').select('*').eq('id', job_id);
        if (jobErr) throw jobErr;
        if (!jobs || jobs.length === 0) return res.status(404).json({ error: 'Job not found' });
        const job = jobs[0];

        // Fetch Resume Info
        const { data: analyses, error: analysisErr } = await supabase.from('resume_analysis').select('*').eq('resume_id', resume_id);
        if (analysisErr) throw analysisErr;
        const analysis = (analyses && analyses.length > 0) ? analyses[0] : null;

        const prompt = `
        Compare this Candidate's skills against the Job Description.
        
        Candidate Skills: ${analysis?.skills ? analysis.skills.join(', ') : 'None'}
        Candidate Experience: ${analysis?.experience || 'None'}
        
        Job Title: ${job.title}
        Job Description: ${job.description}
        Job Requirements: ${job.requirements}
        
        Return ONLY a JSON object with these keys:
        - match_percentage (int 0-100)
        - matched_skills (array of strings)
        - missing_skills (array of strings)
        - fit_level (string: "Excellent Fit", "Good Fit", "Partial Fit", "Not a Fit")
        Do not use markdown wrappers around the JSON.
        `;

        const aiResponse = await analyzeWithGemini(prompt);
        let parsedData = {};
        try {
            parsedData = JSON.parse(aiResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, ''));
        } catch (e) {
            console.error("Could not parse AI JSON:", e, aiResponse);
            parsedData = { match_percentage: 0, matched_skills: [], missing_skills: [], fit_level: "Error evaluating fit" };
        }

        const { data: matchResult, error: matchErr } = await supabase.from('job_match_results')
            .insert([{
                application_id,
                match_percentage: parsedData.match_percentage || 0,
                matched_skills: parsedData.matched_skills || [],
                missing_skills: parsedData.missing_skills || [],
                fit_level: parsedData.fit_level || 'Not Evaluated'
            }])
            .select('*');
        if (matchErr) throw matchErr;

        res.json(matchResult[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 3. Skill Gap & Recommendations
router.post('/recommendations', verifyAuth, async (req, res) => {
    try {
        const { application_id, resume_id } = req.body;

        const { data: matches, error: matchErr } = await supabase.from('job_match_results').select('*').eq('application_id', application_id);
        if (matchErr) throw matchErr;
        const match = (matches && matches.length > 0) ? matches[0] : null;

        const prompt = `
        Based on the candidate missing these skills: ${match?.missing_skills ? match.missing_skills.join(', ') : 'None'}
        
        Generate personalized recommendations. Return ONLY a JSON object with these keys:
        - skills_to_learn (array of strings)
        - tools_tech (array of strings)
        - project_ideas (array of strings)
        - improvements (string: resume improvement tips)
        - interview_tips (string: short prep tips)
        - learning_roadmap (JSON object representing phases: Foundations, Core Skills, Advanced, Projects) each containing a string describing what to learn.
        Do not use markdown wrappers around the JSON.
        `;

        const aiResponse = await analyzeWithGemini(prompt);
        let parsedData = {};
        try {
            parsedData = JSON.parse(aiResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, ''));
        } catch (e) {
            console.error("Could not parse AI JSON:", e, aiResponse);
            parsedData = { skills_to_learn: [], tools_tech: [], project_ideas: [], improvements: '', interview_tips: '', learning_roadmap: {} };
        }

        const { data: recRows, error: recErr } = await supabase.from('recommendations')
            .insert([{
                user_id: req.user.id,
                skills_to_learn: parsedData.skills_to_learn || [],
                tools_tech: parsedData.tools_tech || [],
                project_ideas: parsedData.project_ideas || [],
                improvements: parsedData.improvements || '',
                interview_tips: parsedData.interview_tips || '',
                learning_roadmap: parsedData.learning_roadmap || {}
            }])
            .select('*');
        if (recErr) throw recErr;

        // Also save skill gaps conceptually
        const { error: gapErr } = await supabase.from('skill_gaps')
            .insert([{
                application_id,
                must_have: match?.missing_skills || [],
                good_to_have: [],
                weak_areas: parsedData.skills_to_learn || []
            }]);
        if (gapErr) throw gapErr;

        res.json({ recommendations: recRows[0] });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
