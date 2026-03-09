const express = require('express');
const router = express.Router();
const { verifyAuth, verifyAdmin } = require('./auth');
const db = require('../db');
const { sendEmail } = require('../utils/emailService');
const { evaluateApplication } = require('../utils/screeningService');

// POST /api/applications/:jobId -> User only
router.post('/:jobId', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
    }

    const jobId = req.params.jobId;

    // Check if job exists and get details for email
    const { rows: jobs } = await db.query('SELECT id, title, company_name FROM jobs WHERE id = $1', [jobId]);
    if (jobs.length === 0) return res.status(404).json({ error: 'Job not found' });
    const job = jobs[0];

    // Check if already applied
    const { rows: existing } = await db.query('SELECT id FROM applications WHERE user_id = $1 AND job_id = $2', [req.user.id, jobId]);
    if (existing.length > 0) return res.status(400).json({ error: 'You have already applied for this job' });

    const { full_name, email, phone_number, skills, experience, resume_url, github_url, linkedin_url } = req.body;

    if (!full_name || !email || !phone_number || !skills || !experience || !resume_url) {
      return res.status(400).json({ error: 'All application fields are required' });
    }

    const { rows } = await db.query(`
            INSERT INTO applications (user_id, job_id, status, full_name, email, phone_number, skills, experience, resume_url, github_url, linkedin_url)
            VALUES ($1, $2, 'applied', $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [req.user.id, jobId, full_name, email, phone_number, skills, experience, resume_url, github_url || '', linkedin_url || '']);

    // Send the immediate confirmation email (asynchronously, don't block response)
    const emailSubject = `Application Received: ${job.title} at ${job.company_name}`;
    const emailHtml = `
      <h2>Application Confirmed</h2>
      <p>Dear ${full_name},</p>
      <p>This email is to confirm that we have successfully received your application for the <strong>${job.title}</strong> position at <strong>${job.company_name}</strong>.</p>
      <p>Our team (and our automated AI screening system) will review your profile shortly. You will receive an update regarding your application status within 24 hours.</p>
      <br/>
      <p>Thank you,</p>
      <p>The ${job.company_name} Hiring Team</p>
    `;

    const startTime = Date.now();
    console.log(`[Application] Starting submission for ${email} on job ${jobId}`);

    // Send the immediate confirmation email (awaited for reliability)
    try {
      console.log(`[Email] Attempting to send confirmation to: ${email}`);
      const result = await sendEmail(email, emailSubject, emailHtml);
      if (result === true) {
        console.log(`[Email] Confirmation email sent to ${email} for job: ${job.title}`);
      } else {
        console.error(`[Email] Failed to send confirmation to ${email}:`, result);
      }
    } catch (err) {
      console.error("[Email] Critical failure in confirmation email flow:", err);
    }

    // Trigger AI Screening (Asynchronous - this can stay background)
    evaluateApplication(rows[0].id, jobId).catch(err => console.error("AI Screening trigger failed:", err));

    const duration = Date.now() - startTime;
    console.log(`[Application] Submission complete for ${email}. Total time: ${duration}ms`);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// GET /api/applications/my -> User only
router.get('/my', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only job seekers have applications' });
    }

    const { rows } = await db.query(`
            SELECT a.*, j.title, j.location, j.salary, j.job_type, j.company_name 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.user_id = $1
            ORDER BY a.applied_at DESC
        `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch your applications' });
  }
});

// GET /api/applications/job/:jobId -> Admin only
router.get('/job/:jobId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Verify that the job belongs to this admin
    const { rows: jobs } = await db.query('SELECT id FROM jobs WHERE id = $1 AND admin_id = $2', [jobId, req.user.id]);
    if (jobs.length === 0) return res.status(403).json({ error: 'You do not have permission to view this job\'s applications' });

    const { rows } = await db.query(`
            SELECT a.*, u.name as applicant_name, u.email as applicant_email
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.job_id = $1
            ORDER BY a.applied_at DESC
        `, [jobId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// PUT /api/applications/:id/status -> Admin only
router.put('/:id/status', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!['Shortlisted', 'Selected', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    // Verify that the job belongs to this admin first and fetch applicant+job info for email
    const { rows: appRows } = await db.query(`
      SELECT a.job_id, a.email as candidate_email, u.name as candidate_name,
             j.title as job_title, j.company_name
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1
    `, [applicationId]);

    if (appRows.length === 0) return res.status(404).json({ error: 'Application not found' });

    const jobId = appRows[0].job_id;
    const { rows: jobRows } = await db.query('SELECT id FROM jobs WHERE id = $1 AND admin_id = $2', [jobId, req.user.id]);

    if (jobRows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to modify this application' });
    }

    // Update status and mark email_sent = TRUE so cron doesn't double-email
    const { rows } = await db.query(`
            UPDATE applications
            SET status = $1, email_sent = TRUE
            WHERE id = $2
            RETURNING *
        `, [status, applicationId]);

    const { candidate_email, candidate_name, job_title, company_name } = appRows[0];

    // Send the appropriate email immediately based on status
    let subject = '';
    let htmlContent = '';

    if (status === 'Rejected') {
      subject = `Update on your application for ${job_title} at ${company_name}`;
      htmlContent = `
        <h2>Application Update</h2>
        <p>Dear ${candidate_name},</p>
        <p>Thank you for taking the time to apply for the <strong>${job_title}</strong> position at <strong>${company_name}</strong>.</p>
        <p>After carefully reviewing your application, we have decided not to move forward with your candidacy at this time.</p>
        <p>We appreciate your interest and encourage you to apply for other roles in the future that better align with your current experience.</p>
        <br/>
        <p>Best Regards,</p>
        <p>The ${company_name} Hiring Team</p>
      `;
    } else if (status === 'Shortlisted') {
      subject = `You've been Shortlisted: ${job_title} at ${company_name}`;
      htmlContent = `
        <h2>Great News! You are Shortlisted.</h2>
        <p>Dear ${candidate_name},</p>
        <p>Thank you for applying for the <strong>${job_title}</strong> position at <strong>${company_name}</strong>.</p>
        <p>We were impressed by your skills and experience. We are pleased to inform you that your application has been <strong>Shortlisted</strong> for further review.</p>
        <p>Our hiring team will be taking a closer look at your profile, and we will reach out shortly regarding the next steps.</p>
        <br/>
        <p>Best Regards,</p>
        <p>The ${company_name} Hiring Team</p>
      `;
    } else if (status === 'Selected') {
      subject = `Congratulations! You are Selected for ${job_title}`;
      htmlContent = `
        <h2>Congratulations!</h2>
        <p>Dear ${candidate_name},</p>
        <p>Thank you for applying for the <strong>${job_title}</strong> position at <strong>${company_name}</strong>.</p>
        <p>Your profile and skills are a great match for our requirements. We are thrilled to inform you that you have been <strong>Selected</strong> to proceed to the final stages of our hiring process!</p>
        <p>Please expect a direct call or follow-up email from our recruiters shortly.</p>
        <br/>
        <p>Best Regards,</p>
        <p>The ${company_name} Hiring Team</p>
      `;
    }

    // Send email asynchronously (don't block the API response)
    sendEmail(candidate_email, subject, htmlContent)
      .then(success => {
        if (success) {
          console.log(`[Status Update] Email sent to ${candidate_email} for status: ${status}`);
        } else {
          console.error(`[Status Update] Failed to send email to ${candidate_email}`);
        }
      });

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/applications/:id -> User only
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const appId = req.params.id;
    const userId = req.user.id;

    if (req.user.role !== 'user') return res.status(403).json({ error: 'Only job seekers have applications' });

    const { rows } = await db.query(`
        SELECT a.*, j.title, j.company_name, j.location, j.job_type, j.salary
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = $1 AND a.user_id = $2
    `, [appId, userId]);

    if (rows.length === 0) return res.status(404).json({ error: 'Application not found or unauthorized' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// PUT /api/applications/:id -> User only
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    const appId = req.params.id;
    const userId = req.user.id;

    if (req.user.role !== 'user') return res.status(403).json({ error: 'Only job seekers can edit applications' });

    const { rows: existing } = await db.query('SELECT id FROM applications WHERE id = $1 AND user_id = $2', [appId, userId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Application not found or unauthorized' });

    const { full_name, email, phone_number, skills, experience, resume_url, github_url, linkedin_url } = req.body;

    if (!full_name || !email || !phone_number || !skills || !experience || !resume_url) {
      return res.status(400).json({ error: 'All application fields are required' });
    }

    const { rows } = await db.query(`
        UPDATE applications
        SET full_name = $1, email = $2, phone_number = $3, skills = $4, experience = $5, resume_url = $6, github_url = $7, linkedin_url = $8
        WHERE id = $9
        RETURNING *
    `, [full_name, email, phone_number, skills, experience, resume_url, github_url || '', linkedin_url || '', appId]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE /api/applications/:id -> User only
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const appId = req.params.id;
    const userId = req.user.id;

    if (req.user.role !== 'user') return res.status(403).json({ error: 'Only job seekers can withdraw applications' });

    const { rows: existing } = await db.query('SELECT id FROM applications WHERE id = $1 AND user_id = $2', [appId, userId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Application not found or unauthorized' });

    await db.query('DELETE FROM applications WHERE id = $1', [appId]);
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

module.exports = router;
