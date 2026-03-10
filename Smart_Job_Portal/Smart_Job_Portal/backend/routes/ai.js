const express = require('express');
const router = express.Router();
const { verifyAuth } = require('./auth');
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { localEvaluate } = require('../utils/screeningService');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── 0. Preview Match Score ──────────────────────────────────────────────────
router.get('/preview-match/:jobId', verifyAuth, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id;

        // 1. Get latest resume
        const { rows: resumes } = await db.query(
            'SELECT resume_data FROM user_resumes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        if (resumes.length === 0) {
            return res.json({ score: 0, reason: 'No resume found' });
        }

        // 2. Get job details
        const { rows: jobs } = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
        if (jobs.length === 0) return res.status(404).json({ error: 'Job not found' });

        const job = jobs[0];
        const resumeData = resumes[0].resume_data || {};
        const appMock = buildAppMock(resumeData);

        const result = localEvaluate(job, appMock);
        res.json({ score: result.match_percentage });
    } catch (error) {
        console.error('Preview match error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── 0.1 Preview All Job Matches ─────────────────────────────────────────────
router.get('/preview-all', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get latest resume
        const { rows: resumes } = await db.query(
            'SELECT resume_data FROM user_resumes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        if (resumes.length === 0) {
            return res.json({ scores: {}, reason: 'No resume found' });
        }

        const resumeData = resumes[0].resume_data || {};
        const appMock = buildAppMock(resumeData);

        // 2. Get all active jobs
        const { rows: jobs } = await db.query('SELECT * FROM jobs');

        // 3. Calculate scores for each job
        const scores = {};
        jobs.forEach(job => {
            const result = localEvaluate(job, appMock);
            scores[job.id] = result.match_percentage;
        });

        res.json({ scores });
    } catch (error) {
        console.error('Preview-all error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── Helper: Build mock application from resume data ────────────────────────
function buildAppMock(resumeData) {
    const skills = Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') :
        (typeof resumeData.skills === 'object' ? Object.values(resumeData.skills).flat().join(', ') : (resumeData.skills || ''));

    const expText = Array.isArray(resumeData.experience) ?
        resumeData.experience.map(e => `${e.role || ''} at ${e.company || ''} ${e.description || ''}`).join('; ') :
        (resumeData.experience || '');

    const projectText = Array.isArray(resumeData.projects) ?
        resumeData.projects.map(p => `${p.title || ''} ${p.description || ''}`).join('; ') :
        (resumeData.projects || '');

    const jobTitle = resumeData.personal?.jobTitle || '';

    // Combine everything into skills for searching keywords
    return {
        skills: `${skills} ${jobTitle} ${projectText}`.trim(),
        experience: expText,
        full_name: resumeData.personal?.fullName || 'User'
    };
}

// ─── Helper: Call Gemini (single attempt — instant fallback on rate-limit) ───
async function analyzeWithGemini(prompt) {
    if (!process.env.GEMINI_API_KEY) return 'ERROR: AI Integration Unavailable. Please add GEMINI_API_KEY.';
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

async function analyzeImageWithGemini(prompt, base64Image) {
    if (!process.env.GEMINI_API_KEY) return 'ERROR: AI Integration Unavailable.';
    try {
        // Remove data:image/png;base64, prefix if present
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: "image/jpeg" // Generic fallback, Gemini handles it well
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('GEMINI VISION ERROR:', error);
        return 'ERROR: ' + error.message;
    }
}

// ─── Helper: Smart local resume builder (no AI needed) ──────────────────────
function buildResumeFromPrompt(text, userProfile = {}) {
    const lower = text.toLowerCase();

    // 1. Personal Details
    let fullName = userProfile.name || 'Your Name';
    const nameMatch = text.match(/(?:I(?:'m| am)|My name is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
    if (nameMatch) fullName = nameMatch[1];

    const titleKeywords = [
        'software engineer', 'frontend developer', 'backend developer', 'full stack developer',
        'web developer', 'data scientist', 'data analyst', 'devops engineer',
        'product manager', 'ui/ux designer', 'mobile developer', 'java developer', 'python developer',
        'react developer', 'node.js developer', 'qa engineer', 'tech lead'
    ];
    let jobTitle = 'Professional';
    for (const kw of titleKeywords) {
        if (lower.includes(kw)) { jobTitle = kw.replace(/\b\w/g, c => c.toUpperCase()); break; }
    }

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[- ]?)?\(?\d{3,4}\)?[- ]?\d{3,4}[- ]?\d{4,6}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);

    const expMatch = text.match(/(\d+)\s*(?:\+\s*)?years?\s*(?:of\s+)?(?:experience|exp)/i);
    const expYears = expMatch ? expMatch[1] : '';

    // 2. Skills
    const skillMap = {
        frontend: ['react', 'html', 'css', 'javascript', 'typescript', 'next.js', 'tailwind', 'redux'],
        backend: ['node.js', 'express', 'python', 'java', 'go', 'flask', 'django', 'fastapi'],
        database: ['mysql', 'postgresql', 'mongodb', 'firebase', 'redis', 'sqlite'],
        tools: ['git', 'docker', 'aws', 'gcp', 'jenkins', 'jira', 'figma']
    };
    const skills = { frontend: [], backend: [], database: [], tools: [] };
    for (const [cat, list] of Object.entries(skillMap)) {
        for (const skill of list) {
            if (lower.includes(skill)) skills[cat].push(skill.replace(/\b\w/g, c => c.toUpperCase()));
        }
    }

    // summary construction
    const allSkills = [...skills.frontend, ...skills.backend, ...skills.database, ...skills.tools];
    const topSkills = allSkills.slice(0, 4).join(', ') || 'industry standard technologies';
    const summary = userProfile.professional_profile 
        ? userProfile.professional_profile 
        : `Dynamic and results-oriented ${jobTitle} with a passion for building high-quality software solutions. ${expYears ? `With ${expYears}+ years of experience, I have` : 'I have'} developed a strong foundation in ${topSkills}. Proven ability to collaborate in fast-paced environments and deliver impactful results.`;

    // 3. Projects
    const projects = [
        {
            title: `${jobTitle} Portfolio Project`,
            description: `Developed a comprehensive application using ${topSkills}. Implemented core features including user authentication, real-time data sync, and responsive UI components.`
        }
    ];

    // 4. Experience
    const experiences = [];
    if (expYears) {
        experiences.push({
            company: 'Current/Recent Company',
            role: jobTitle,
            duration: `${expYears} Year(s)`,
            description: `Leading development of key features using ${topSkills}. Optimized performance, improved codebase maintainability, and collaborated with cross-functional teams.`
        });
    } else {
        experiences.push({
            company: 'Professional Projects / Internships',
            role: jobTitle,
            duration: '6 Months',
            description: `Contributed to various development cycles, focusing on ${topSkills}. Resolved critical bugs, implemented UI enhancements, and improved documentation.`
        });
    }

    // 5. Education
    let degree = '';
    let college = '';
    let gradYear = '';
    const degreeMatch = text.match(/\b(?:B\.?Tech|M\.?Tech|BTech|MTech|B\.?E\.|M\.?E\.|B\.?S\.|M\.?S\.|Bachelor|Master|BCA|MCA)\b[^,.\n]*/i);
    if (degreeMatch) degree = degreeMatch[0].trim();
    const collegeMatch = text.match(/(?:from|at|in|,)\s+([A-Z][^\n,;]{2,60}(?:University|College|Institute|IIT|NIT|GPCET)[^\n,;]*)/i);
    if (collegeMatch) college = collegeMatch[1].trim();
    const yearMatch = text.match(/(20\d{2}|\d(?:st|nd|rd|th)\s*yr)/i);
    if (yearMatch) gradYear = yearMatch[1];
    const cgpaMatch = text.match(/(?:cgpa|GPA|Percentage)\s*[:=]?\s*(\d+(?:\.\d+)?)/i) || text.match(/(\d+(?:\.\d+)?)\s*(?:cgpa|GPA|Percentage)/i);

    const education = [{
        degree: degree || (lower.includes('student') ? 'Pursuing Degree' : 'Degree Name'),
        college: college || 'University Name',
        year: gradYear || 'Year',
        cgpa: cgpaMatch ? (cgpaMatch[1] || cgpaMatch[2] || '') : ''
    }];

    // 6. Certifications
    const certifications = [];
    if (lower.includes('certified') || lower.includes('certification')) {
        certifications.push({ name: 'Professional Certification', issuer: 'Global Authority' });
    }

    // 7. Achievements
    const achievements = [
        { description: 'Consistently delivered complex features within tight deadlines while maintaining high code quality.' },
        { description: 'Improved system efficiency by 20% through code optimization and architecture refinement.' }
    ];

    return {
        personal: {
            fullName, jobTitle,
            email: emailMatch ? emailMatch[0] : (userProfile.email || 'your.email@example.com'),
            phone: phoneMatch ? phoneMatch[0] : (userProfile.phone || '+91 XXXXX XXXXX'),
            linkedin: linkedinMatch ? linkedinMatch[0] : (userProfile.linkedin_url || 'linkedin.com/in/yourprofile'),
            github: githubMatch ? githubMatch[0] : (userProfile.github_url || 'github.com/yourusername'),
            profile_photo: userProfile.profile_photo || '',
            portfolio: '', summary
        },
        skills,
        projects,
        experience: experiences,
        education,
        certifications,
        achievements
    };
}

// ─── 1. Resume Analysis ──────────────────────────────────────────────────────
router.post('/analyze-resume', verifyAuth, async (req, res) => {
    try {
        const { resume_id } = req.body;
        const { rows: resumes } = await db.query('SELECT * FROM resumes WHERE id = $1', [resume_id]);
        if (resumes.length === 0) throw new Error('Resume not found');
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

        const { rows: analysis } = await db.query(`
            INSERT INTO resume_analysis (
                resume_id, skills, experience, education, projects,
                readiness_score, tech_score, projects_score, comm_score, structure_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            resume_id,
            parsedData.skills || [],
            parsedData.experience || '',
            parsedData.education || '',
            parsedData.projects || '',
            parsedData.readiness_score || 0,
            parsedData.tech_score || 0,
            parsedData.projects_score || 0,
            parsedData.comm_score || 0,
            parsedData.structure_score || 0
        ]);
        res.json(analysis[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── 2. Job Matching ─────────────────────────────────────────────────────────
router.post('/match-job', verifyAuth, async (req, res) => {
    try {
        const { application_id, job_id, resume_id } = req.body;
        const { rows: jobs } = await db.query('SELECT * FROM jobs WHERE id = $1', [job_id]);
        if (jobs.length === 0) return res.status(404).json({ error: 'Job not found' });
        const job = jobs[0];

        const { rows: analyses } = await db.query('SELECT * FROM resume_analysis WHERE resume_id = $1', [resume_id]);
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

        const { rows: matchResult } = await db.query(`
            INSERT INTO job_match_results (
                application_id, match_percentage, matched_skills, missing_skills, fit_level
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            application_id,
            parsedData.match_percentage || 0,
            parsedData.matched_skills || [],
            parsedData.missing_skills || [],
            parsedData.fit_level || 'Not Evaluated'
        ]);
        res.json(matchResult[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── 3. Skill Gap & Recommendations ─────────────────────────────────────────
router.post('/recommendations', verifyAuth, async (req, res) => {
    try {
        const { application_id, resume_id } = req.body;
        const { rows: matches } = await db.query('SELECT * FROM job_match_results WHERE application_id = $1', [application_id]);
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

        const { rows: recRows } = await db.query(`
            INSERT INTO recommendations (
                user_id, skills_to_learn, tools_tech, project_ideas, improvements, interview_tips, learning_roadmap
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            req.user.id,
            parsedData.skills_to_learn || [],
            parsedData.tools_tech || [],
            parsedData.project_ideas || [],
            parsedData.improvements || '',
            parsedData.interview_tips || '',
            parsedData.learning_roadmap || {}
        ]);

        await db.query(`
            INSERT INTO skill_gaps (application_id, must_have, good_to_have, weak_areas)
            VALUES ($1, $2, $3, $4)
        `, [application_id, match?.missing_skills || [], [], parsedData.skills_to_learn || []]);

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
            linkedin_url: profileData.linkedin_url || '',
            professional_profile: profileData.professional_profile || '',
            profile_photo: profileData.profile_photo || ''
        };

        let aiPrompt = '';
        if (currentResume) {
            aiPrompt = `
            Expert Resume Editor. Update JSON based on: "${userPrompt}"
            7 Sections: personal, skills, projects, experience, education (include cgpa field if mentioned), certifications, achievements.
            Identity: fullName: "${userInfo.name}", email: "${userInfo.email}", phone: "${userInfo.phone}", linkedin: "${userInfo.linkedin_url}", github: "${userInfo.github_url}", profile_photo: "${userInfo.profile_photo}".
            Biographical Hint: "${userInfo.professional_profile}" (use for summary/experience).
            Strictly: Use **bold** for technical keywords. Return raw JSON. No markdown wrappers.
            
            Current: ${JSON.stringify(currentResume)}
            `;
        } else {
            aiPrompt = `
            Expert Resume Architect. Generate ATS JSON from: "${userPrompt}"
            Use Sections: personal, skills, projects, experience, education (include cgpa field), certifications, achievements.
            Identity: fullName: "${userInfo.name}", email: "${userInfo.email}", phone: "${userInfo.phone}", linkedin: "${userInfo.linkedin_url}", github: "${userInfo.github_url}", profile_photo: "${userInfo.profile_photo}"
            Biographical Hint: "${userInfo.professional_profile}" (use to craft original summary/experience).
            Rules: **bold** tech keywords. Professional summary (3 sentences). Return raw JSON.
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

// 6. Verify professional photo
router.post('/verify-photo', verifyAuth, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: 'Image required' });

        const prompt = `
            Act as a strict professional recruiter. Analyze this image for a career platform profile.
            Is this a high-quality professional headshot or a formal portrait of a single person?
            
            STRICT CRITERIA FOR NO:
            - Casual selfies, gym photos, beach photos, or party pictures.
            - Images with multiple people, pets, or distracting backgrounds.
            - Memes, cartoons, landscapes, or low-resolution/blurry shots.
            - Full-body shots where the face is too small.
            - Inappropriate attire (e.g., swimwear, sleepwear).
            
            STRICT CRITERIA FOR YES:
            - A clear, well-lit headshot or torso-up portrait of ONE person.
            - Professional or neutral background.
            - Professional attire or tidy casual wear suitable for an office environment.
            
            If it's just a regular 'normal' casual photo, reply: NO.
            Only if it looks like a professional profile picture, reply: YES.
            Reply with EXACTLY one word: YES or NO.
        `;

        const result = await analyzeImageWithGemini(prompt, image);
        const sanitized = (result || '').trim().toUpperCase();
        
        // Strict mapping: Only a clear YES with no NO anywhere in the string counts
        const isProfessional = sanitized.includes('YES') && !sanitized.includes('NO');

        res.json({ isProfessional });
    } catch (error) {
        console.error('Photo verification crash:', error);
        res.status(500).json({ error: 'Failed to verify photo' });
    }
});

module.exports = router;
