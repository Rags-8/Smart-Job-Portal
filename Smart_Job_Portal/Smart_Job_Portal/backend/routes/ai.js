const express = require('express');
const router = express.Router();
const { verifyAuth } = require('./auth');
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Helper: Call Gemini (single attempt — instant fallback on rate-limit) ───
async function analyzeWithGemini(prompt) {
    if (!process.env.GEMINI_API_KEY) return 'ERROR: AI Integration Unavailable. Please add GEMINI_API_KEY.';
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        const isRateLimit = error.status === 429 || (error.message && error.message.includes('429'));
        console.warn('GEMINI:', isRateLimit ? 'Rate limited — using local fallback.' : error.message);
        if (isRateLimit) return 'ERROR: rate_limit';
        return 'ERROR: ' + (error.message || 'Unknown Gemini error');
    }
}

// ─── Helper: Smart local resume builder (no AI needed) ──────────────────────
function buildResumeFromPrompt(text, userProfile = {}) {
    const lower = text.toLowerCase();

    // Extract name
    let fullName = userProfile.name || 'Your Name';
    const nameMatch = text.match(/(?:I(?:'m| am)|My name is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
    if (nameMatch) fullName = nameMatch[1];

    // Extract job title
    const titleKeywords = [
        'software engineer', 'frontend developer', 'backend developer', 'full stack developer',
        'full-stack developer', 'web developer', 'data scientist', 'data analyst', 'devops engineer',
        'product manager', 'ui/ux designer', 'mobile developer', 'android developer', 'ios developer',
        'machine learning engineer', 'cloud engineer', 'java developer', 'python developer',
        'react developer', 'node.js developer', 'qa engineer', 'tech lead', 'senior developer', 'junior developer'
    ];
    let jobTitle = 'Software Engineer';
    for (const kw of titleKeywords) {
        if (lower.includes(kw)) { jobTitle = kw.replace(/\b\w/g, c => c.toUpperCase()); break; }
    }

    // Extract contacts
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[- ]?)?\(?\d{3,4}\)?[- ]?\d{3,4}[- ]?\d{4,6}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);

    // Extract years of experience
    const expMatch = text.match(/(\d+)\s*(?:\+\s*)?years?\s*(?:of\s+)?(?:experience|exp)/i);
    const expYears = expMatch ? expMatch[1] : '';

    // Extract skills
    const skillMap = {
        frontend: ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'next.js', 'svelte', 'tailwind', 'redux', 'jquery', 'bootstrap', 'sass'],
        backend: ['node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'fastapi', 'graphql', 'rest api', 'java', 'python', 'go', 'php', 'c#', '.net', 'ruby', 'kotlin'],
        database: ['mysql', 'postgresql', 'mongodb', 'firebase', 'redis', 'sqlite', 'dynamodb', 'supabase', 'oracle', 'cassandra'],
        tools: ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'linux', 'jira', 'figma', 'postman', 'terraform', 'github actions']
    };
    const skills = { frontend: [], backend: [], database: [], tools: [] };
    for (const [cat, list] of Object.entries(skillMap)) {
        for (const skill of list) {
            if (lower.includes(skill)) skills[cat].push(skill.replace(/\b\w/g, c => c.toUpperCase()));
        }
    }

    // Extract education
    let degree = '';
    let college = '';
    let gradYear = '';
    const degreeMatch = text.match(/\b(?:B\.?Tech|M\.?Tech|BTech|MTech|B\.?E\.|M\.?E\.|B\.?S\.|M\.?S\.|Bachelor(?:'s)?|Master(?:'s)?|PhD|MBA|BSc|MSc|BCA|MCA|BBA)\b[^,.\n]*/i);
    if (degreeMatch) degree = degreeMatch[0].trim();

    // Broaden college match to catch "in GPCET", "college of", etc. Allow dots for "G. Pullaiah"
    const collegeMatch = text.match(/(?:from|at|in|,)\s+([A-Z][^\n,;]{2,60}(?:University|College|Institute|IIT|NIT|MIT|BITS|GPCET)[^\n,;]*)/i);
    if (collegeMatch) college = collegeMatch[1].trim();

    // Look for year or "3rd yr"
    const yearMatch = text.match(/(20\d{2}|\d(?:st|nd|rd|th)\s*yr|\d(?:st|nd|rd|th)\s*year)/i);
    if (yearMatch) gradYear = yearMatch[1];

    let educationData = [];
    if (degree || college || gradYear) {
        // Provide clear placeholders so the user sees the expected 3-line ATS layout
        educationData.push({
            degree: degree || 'Degree Name',
            college: college || 'College/University Name',
            year: gradYear || 'Expected Graduation Year'
        });
    }

    // Build summary
    const expPhrase = expYears ? `${expYears}+ years of` : 'proven';
    const allSkills = [...skills.frontend, ...skills.backend, ...skills.database, ...skills.tools];
    const topSkills = allSkills.slice(0, 5).join(', ') || 'modern development technologies';
    const summary = `Dynamic and results-driven ${jobTitle} bringing ${expPhrase} experience in building scalable solutions using ${topSkills}. Committed to delivering high-quality code and optimizing system performance to achieve business objectives. Proven track record of collaborating across teams to ship exceptional products.`;

    // Build experience
    const experiences = [];
    if (expYears && parseInt(expYears) > 1) {
        experiences.push({
            company: 'Tech Company',
            role: jobTitle,
            duration: `${Math.max(1, parseInt(expYears) - 1)} Year(s)`,
            description: `Led design and delivery of software solutions using ${topSkills}. Collaborated cross-functionally, performed code reviews, and mentored junior engineers.`
        });
    }
    experiences.push({
        company: 'Previous Employer',
        role: `Junior ${jobTitle}`,
        duration: '1 Year',
        description: 'Built and maintained web applications in agile sprints. Resolved bugs, improved performance, and contributed to architecture discussions.'
    });

    return {
        personal: {
            fullName,
            jobTitle,
            email: emailMatch ? emailMatch[0] : (userProfile.email || 'your.email@example.com'),
            phone: phoneMatch ? phoneMatch[0] : (userProfile.phone || '+91 XXXXX XXXXX'),
            linkedin: linkedinMatch ? linkedinMatch[0] : (userProfile.linkedin_url || 'linkedin.com/in/yourprofile'),
            github: githubMatch ? githubMatch[0] : (userProfile.github_url || 'github.com/yourusername'),
            portfolio: '',
            summary
        },
        skills,
        projects: [
            {
                title: `${jobTitle.split(' ')[0]} Portfolio App`,
                description: `Full-featured application built with ${allSkills.slice(0, 3).join(', ') || 'modern stack'}. Includes authentication, dashboards, and responsive design.`
            },
            {
                title: 'Open Source Contribution',
                description: 'Contributed enhancements and bug fixes to open source repositories. Improved test coverage and documentation.'
            }
        ],
        experience: experiences,
        education: educationData,
        certifications: [],
        achievements: [
            { description: 'Delivered key features ahead of schedule, accelerating product release timelines.' },
            { description: 'Recognized for exceptional technical contributions and cross-team collaboration.' }
        ]
    };
}

// ─── 1. Resume Analysis ──────────────────────────────────────────────────────
router.post('/analyze-resume', verifyAuth, async (req, res) => {
    try {
        const { resume_id } = req.body;
        const { data: resumes, error: resumeErr } = await supabase.from('resumes').select('*').eq('id', resume_id);
        if (resumeErr) throw resumeErr;
        if (!resumes || resumes.length === 0) throw new Error('Resume not found');
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
        if (aiResponse.startsWith('ERROR: ')) {
            return res.status(400).json({ error: aiResponse.replace('ERROR: ', '') });
        }
        let parsedData = {};
        try {
            parsedData = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, ''));
        } catch (e) {
            console.error('Could not parse AI JSON:', e, aiResponse);
            parsedData = { error: 'Failed to process AI output' };
        }

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

// ─── 2. Job Matching ─────────────────────────────────────────────────────────
router.post('/match-job', verifyAuth, async (req, res) => {
    try {
        const { application_id, job_id, resume_id } = req.body;
        const { data: jobs, error: jobErr } = await supabase.from('jobs').select('*').eq('id', job_id);
        if (jobErr) throw jobErr;
        if (!jobs || jobs.length === 0) return res.status(404).json({ error: 'Job not found' });
        const job = jobs[0];

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
        if (aiResponse.startsWith('ERROR: ')) {
            return res.status(400).json({ error: aiResponse.replace('ERROR: ', '') });
        }
        let parsedData = {};
        try {
            parsedData = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, ''));
        } catch (e) {
            console.error('Could not parse AI JSON:', e, aiResponse);
            parsedData = { match_percentage: 0, matched_skills: [], missing_skills: [], fit_level: 'Error evaluating fit' };
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

// ─── 3. Skill Gap & Recommendations ─────────────────────────────────────────
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
        if (aiResponse.startsWith('ERROR: ')) {
            return res.status(400).json({ error: aiResponse.replace('ERROR: ', '') });
        }
        let parsedData = {};
        try {
            parsedData = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, ''));
        } catch (e) {
            console.error('Could not parse AI JSON:', e, aiResponse);
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

// ─── 4. Generate Resume from Prompt (AI + smart local fallback) ──────────────
router.post('/generate-resume-from-prompt', verifyAuth, async (req, res) => {
    try {
        const { prompt: userPrompt, currentResume } = req.body;
        console.log(`[Resume Generation] Mode: ${currentResume ? 'Update' : 'New'}, Prompt: "${userPrompt.substring(0, 50)}..."`);

        if (!userPrompt || userPrompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const { rows } = await db.query('SELECT name, email, profile_data FROM users WHERE id = $1', [req.user.id]);
        const dbUser = rows[0] || {};
        const profileData = dbUser.profile_data || {};
        const userInfo = {
            name: dbUser.name || '',
            email: dbUser.email || '',
            phone: profileData.phone || '',
            github_url: profileData.github_url || '',
            linkedin_url: profileData.linkedin_url || ''
        };

        let aiPrompt = '';
        if (currentResume) {
            aiPrompt = `
            ACT AS AN EXPERT RESUME EDITOR AND ANALYST.
            TASK: Update the provided resume JSON based on the user's request. Deeply analyze their request and make professional modifications.
            USER REQUEST: "${userPrompt}"
            CURRENT RESUME JSON:
            ${JSON.stringify(currentResume)}

            CRITICAL RULES:
            1. ONLY change what is requested or necessitated by the request.
            2. If the user provides a description or asks to update the summary, write a NEW, elevated 2-3 sentence professional summary highlighting their strengths. DO NOT just copy their raw text.
            3. If the user provides education details, EXACTLY extract and use their provided degree, college, and year. Do not hallucinate incorrect education data.
            4. HIGHLIGHT KEYWORDS: Use Markdown bold (**word**) to highlight important technical skills, tools, and metrics throughout the summary, experience, and projects sections.
            5. For all other fields not mentioned in the request, keep the EXACT data from the CURRENT RESUME JSON.
            6. Return the COMPLETE, VALIDATED, updated JSON.
            7. DO NOT include any text, explanations, or markdown wrappers like \`\`\`json. JUST the JSON object.
            `;
        } else {
            aiPrompt = `
            ACT AS AN EXPERT RESUME WRITER AND ANALYST.
            TASK: Deeply analyze the user's description and generate a highly professional, ATS-friendly resume based on this prompt: "${userPrompt}"
            
            RULES:
            1. Return ONLY a valid JSON object.
            2. Follow this structure exactly (ensure it matches the required types):
               {
                 "personal": { "fullName": "", "jobTitle": "", "email": "", "phone": "", "linkedin": "", "github": "", "portfolio": "", "summary": "" },
                 "skills": { "frontend": [], "backend": [], "database": [], "tools": [] },
                 "projects": [ { "title": "", "description": "" } ],
                 "experience": [ { "company": "", "role": "", "duration": "", "description": "" } ],
                 "education": [ { "degree": "", "college": "", "year": "" } ],
                 "certifications": [ { "name": "", "issuer": "" } ],
                 "achievements": [ { "description": "" } ]
               }
            3. CREATE A REAL PROFESSIONAL SUMMARY: For the "summary" field, write a compelling 2-3 sentence paragraph highlighting the candidate's career objectives, key skills, and strengths based on the prompt. DO NOT just copy and paste the user's text into the summary. Synthesize and elevate it to sound like a top-tier professional.
            4. EDUCATION ANALYSIS: If the user explicitly mentions degrees, universities, or graduation years, use them EXACTLY as provided. DO NOT guess or make up incorrect education data. If NO education is mentioned in the prompt, you MUST set the "education" array to an empty array [].
            5. PROFILE DEFAULTS (CRITICAL): For the "personal" section, you MUST default to using the following details (unless the user explicitly provides different contact details in their prompt):
               fullName: "${userInfo.name}"
               email: "${userInfo.email}"
               phone: "${userInfo.phone}"
               linkedin: "${userInfo.linkedin_url}"
               github: "${userInfo.github_url}"
            6. COMPREHENSIVE DETAILS: Deeply read the user's prompt. Identify their specified skills, project details, and experience. Expand them into professional bullet points using standard ATS keywords. Use creative placeholders only for missing info.
            7. HIGHLIGHT KEYWORDS: Use Markdown bold (**word**) to highlight important technical skills, frameworks, tools, and metrics throughout the summary, experience descriptions, and project descriptions.
            8. DO NOT include any text outside the JSON. No markdown formatting outside of the JSON values (e.g. no \`\`\`json wrappers).
            `;
        }

        const aiResponse = await analyzeWithGemini(aiPrompt);

        // If AI is unavailable or produces an error string
        if (!aiResponse || aiResponse.startsWith('ERROR:') || aiResponse.includes('rate_limit') || aiResponse.toLowerCase().includes('api key')) {
            console.error('[Resume Generation] AI Error or Unavailable:', aiResponse);
            if (currentResume) {
                // Try a very rudimentary fallback update for education if asked
                const lowerPrompt = userPrompt.toLowerCase();
                if (lowerPrompt.includes('education') || lowerPrompt.includes('college') || lowerPrompt.includes('btech')) {
                    const fallbackData = buildResumeFromPrompt(userPrompt, userInfo);
                    const updated = JSON.parse(JSON.stringify(currentResume));
                    updated.education = [{
                        degree: fallbackData.education[0]?.degree || (lowerPrompt.includes('btech') ? 'B.Tech' : 'Degree Name'),
                        college: fallbackData.education[0]?.college || userPrompt.replace(/update (my )?education/i, '').substring(0, 60).trim() || 'College/University Name',
                        year: fallbackData.education[0]?.year || 'Expected Graduation Year'
                    }];
                    return res.json(updated);
                }
                return res.status(503).json({ error: "AI service is currently busy or out of quota. Please use 'Manual Edit' to make specific updates for now." });
            }
            return res.json(buildResumeFromPrompt(userPrompt, userInfo));
        }

        let parsedData = null;
        try {
            // Robust extraction: find the first { and last } to isolate the JSON block
            const firstBrace = aiResponse.indexOf('{');
            const lastBrace = aiResponse.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonCandidate = aiResponse.substring(firstBrace, lastBrace + 1);
                parsedData = JSON.parse(jsonCandidate);
            } else {
                throw new Error('No JSON braces found in response');
            }
        } catch (e) {
            console.error('[Resume Generation] Parse Error. Raw Response:', aiResponse);
            console.error('[Resume Generation] Error details:', e.message);
            if (currentResume) {
                return res.status(500).json({ error: "The AI formatted its response incorrectly. Please try again or use 'Manual Edit'." });
            }
            return res.json(buildResumeFromPrompt(userPrompt, userInfo));
        }

        // Basic validation: ensure expected keys exist
        if (parsedData && parsedData.personal) {
            console.log('[Resume Generation] Success: Full resume generated/updated.');
            return res.json(parsedData);
        } else {
            console.error('[Resume Generation] Invalid JSON shape:', parsedData);
            if (currentResume) {
                return res.status(500).json({ error: "The AI skipped some required fields. Please use 'Manual Edit' to continue." });
            }
            return res.json(buildResumeFromPrompt(userPrompt, userInfo));
        }
    } catch (error) {
        console.error('[Resume Generation] Crash Error:', error);
        res.status(500).json({ error: 'Deep AI processing error. Please try again.' });
    }
});


// 5. Get AI Match Result for an application
router.get('/match-result/:applicationId', verifyAuth, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { rows } = await db.query(
            'SELECT * FROM job_match_results WHERE application_id = $1 ORDER BY created_at DESC LIMIT 1',
            [applicationId]
        );
        if (rows.length === 0) {
            return res.json(null); // No result yet
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching match result:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
