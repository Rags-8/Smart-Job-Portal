const cron = require('node-cron');
const db = require('../db');
const { sendEmail } = require('../utils/emailService');

// Change this line to '* * * * *' to run every minute for testing.
// Currently set to '0 * * * *' to run every hour on the hour.
const CRON_SCHEDULE = '0 * * * *';

// Evaluate Application Score (Simple Text Match)
// Normally, this could call Gemini, but using a robust text-matcher prevents API Key rate limits/errors for background tasks.
const evaluateScore = (applicantSkills, jobSkills) => {
    if (!jobSkills || jobSkills.trim() === '') return 75; // Default if no skills required

    const requiredSkillsArr = jobSkills.split(',').map(s => s.trim().toLowerCase());
    const applicantSkillsArr = applicantSkills ? applicantSkills.split(',').map(s => s.trim().toLowerCase()) : [];

    let matchCount = 0;
    requiredSkillsArr.forEach(reqSkill => {
        if (applicantSkillsArr.some(as => as.includes(reqSkill) || reqSkill.includes(as))) {
            matchCount++;
        }
    });

    const baseScore = requiredSkillsArr.length > 0 ? (matchCount / requiredSkillsArr.length) * 100 : 75;
    // Round to nearest integer and cap to 100
    return Math.min(100, Math.max(0, Math.round(baseScore)));
};

// Start the Cron Job
const startScheduler = () => {
    console.log(`[Cron] Background email scheduler started. Running schedule: ${CRON_SCHEDULE}`);

    cron.schedule(CRON_SCHEDULE, async () => {
        console.log('[Cron] Running scheduled check for pending 24hr update emails...');

        try {
            // Find all applications older than 24 hours that haven't had an email sent yet
            // Using parameterized interval for clarity.
            const pendingQuery = `
                SELECT 
                    a.id as application_id, a.skills as applicant_skills, a.status, a.email_sent, a.ai_match_score,
                    u.name as candidate_name, u.email as candidate_email,
                    j.title as job_title, j.skills_required as job_skills,
                    j.company_name
                FROM applications a
                JOIN users u ON a.user_id = u.id
                JOIN jobs j ON a.job_id = j.id
                WHERE a.email_sent = FALSE 
                AND a.applied_at <= NOW() - INTERVAL '24 HOURS'
            `;

            // For rapid testing, use this instead of 24 hours to trigger immediately:
            // AND a.applied_at <= NOW() - INTERVAL '1 MINUTE'

            const { rows: pendingApps } = await db.query(pendingQuery);

            if (pendingApps.length === 0) {
                console.log('[Cron] No pending applications older than 24h found.');
                return;
            }

            console.log(`[Cron] Found ${pendingApps.length} pending applications to process.`);

            for (const app of pendingApps) {
                // 1. Determine or calculate score
                let score = app.ai_match_score;
                if (score === null || score === undefined) {
                    score = evaluateScore(app.applicant_skills, app.job_skills);
                    // Update the DB with the calculated score so we don't recalculate if it fails sending
                    await db.query(`UPDATE applications SET ai_match_score = $1 WHERE id = $2`, [score, app.application_id]);
                }

                // 2. Determine template logic based on score
                let subject = '';
                let htmlContent = '';
                let adminAction = '';

                if (score < 70) {
                    subject = `Update on your application for ${app.job_title} at ${app.company_name}`;
                    htmlContent = `
                        <h2>Application Update</h2>
                        <p>Dear ${app.candidate_name},</p>
                        <p>Thank you for taking the time to apply for the <strong>${app.job_title}</strong> position at <strong>${app.company_name}</strong>.</p>
                        <p>After carefully reviewing your application and evaluating your skills against our core requirements, we have decided not to move forward with your candidacy at this time.</p>
                        <p>We appreciate your interest and encourage you to apply for other roles in the future that better align with your current experience.</p>
                        <br/>
                        <p>Best Regards,</p>
                        <p>The ${app.company_name} Hiring Team</p>
                    `;
                    adminAction = 'Rejected';
                } else if (score >= 70 && score <= 85) {
                    subject = `You've been Shortlisted: ${app.job_title} at ${app.company_name}`;
                    htmlContent = `
                        <h2>Great News! You are Shortlisted.</h2>
                        <p>Dear ${app.candidate_name},</p>
                        <p>Thank you for applying for the <strong>${app.job_title}</strong> position at <strong>${app.company_name}</strong>.</p>
                        <p>We were impressed by your skills and experience. We are pleased to inform you that your application has been <strong>Shortlisted</strong> for further review.</p>
                        <p>Our hiring team will be taking a closer look at your profile, and we will reach out shortly regarding the next steps, which may include a technical interview.</p>
                        <br/>
                        <p>Best Regards,</p>
                        <p>The ${app.company_name} Hiring Team</p>
                    `;
                    adminAction = 'Shortlisted';
                } else {
                    subject = `Congratulations! You are Selected for ${app.job_title}`;
                    htmlContent = `
                        <h2>Congratulations!</h2>
                        <p>Dear ${app.candidate_name},</p>
                        <p>Thank you for applying for the <strong>${app.job_title}</strong> position at <strong>${app.company_name}</strong>.</p>
                        <p>Your profile and skills are a phenomenal match for our requirements. We are thrilled to inform you that you have been <strong>Selected</strong> to proceed directly to the final stages of our hiring process!</p>
                        <p>Please expect a direct call or follow-up email from our recruiters shortly to schedule your onboarding and final interviews.</p>
                        <br/>
                        <p>Best Regards,</p>
                        <p>The ${app.company_name} Hiring Team</p>
                    `;
                    adminAction = 'Selected';
                }

                // 3. Send email
                const success = await sendEmail(app.candidate_email, subject, htmlContent);

                if (success) {
                    // Update Database to mark email_sent = TRUE and sync the admin action status
                    await db.query(`
                        UPDATE applications 
                        SET email_sent = TRUE, status = $1 
                        WHERE id = $2
                    `, [adminAction, app.application_id]);
                    console.log(`[Cron] Successfully processed applicant ${app.candidate_email} (Score: ${score})`);
                } else {
                    console.error(`[Cron] Retry needed next hour for ${app.candidate_email}`);
                }
            }

        } catch (error) {
            console.error('[Cron] Error during scheduled execution:', error);
        }
    });
};

module.exports = { startScheduler };
