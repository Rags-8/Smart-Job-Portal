const express = require('express');
const router = express.Router();
const { verifyAuth, verifyAdmin } = require('./auth');
const db = require('../db');

// POST /api/applications/:jobId -> User only
router.post('/:jobId', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
    }

    const jobId = req.params.jobId;

    // Check if job exists
    const { rows: jobs } = await db.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
    if (jobs.length === 0) return res.status(404).json({ error: 'Job not found' });

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

    // Verify that the job belongs to this admin first
    const { rows: appRows } = await db.query('SELECT job_id FROM applications WHERE id = $1', [applicationId]);
    if (appRows.length === 0) return res.status(404).json({ error: 'Application not found' });

    const jobId = appRows[0].job_id;
    const { rows: jobRows } = await db.query('SELECT id FROM jobs WHERE id = $1 AND admin_id = $2', [jobId, req.user.id]);

    if (jobRows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to modify this application' });
    }

    const { rows } = await db.query(`
            UPDATE applications
            SET status = $1
            WHERE id = $2
            RETURNING *
        `, [status, applicationId]);

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
