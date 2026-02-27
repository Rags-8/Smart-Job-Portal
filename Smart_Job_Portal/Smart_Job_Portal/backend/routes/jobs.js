const express = require('express');
const router = express.Router();
const { verifyAuth, verifyAdmin } = require('./auth');
const db = require('../db');

// POST /api/jobs -> Admin only
router.post('/', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const {
            title, location, salary, job_type, description,
            company_name, company_website, company_description,
            experience_required, skills_required, number_of_openings,
            application_last_date, responsibilities, requirements, benefits
        } = req.body;

        if (!title || !location || !salary || !job_type || !description ||
            !company_name || !experience_required || !skills_required ||
            !number_of_openings || !application_last_date || !responsibilities || !requirements) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const { rows } = await db.query(`
            INSERT INTO jobs (
                title, location, salary, job_type, description, admin_id,
                company_name, company_website, company_description,
                experience_required, skills_required, number_of_openings,
                application_last_date, responsibilities, requirements, benefits
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `, [
            title, location, salary, job_type, description, req.user.id,
            company_name, company_website, company_description,
            experience_required, skills_required, number_of_openings,
            application_last_date, responsibilities, requirements, benefits
        ]);

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ error: 'Failed to post job' });
    }
});

// GET /api/jobs -> Public
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT j.*, u.name as admin_name 
            FROM jobs j
            JOIN users u ON j.admin_id = u.id
            WHERE j.application_last_date >= CURRENT_DATE
            ORDER BY j.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// GET /api/jobs/admin/my-jobs -> Admin only
router.get('/admin/my-jobs', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT * FROM jobs 
            WHERE admin_id = $1 
            ORDER BY created_at DESC
        `, [req.user.id]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching admin jobs:', error);
        res.status(500).json({ error: 'Failed to fetch admin jobs' });
    }
});

// GET /api/jobs/:id -> Public
router.get('/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const { rows } = await db.query(`
            SELECT j.*, u.name as admin_name 
            FROM jobs j
            JOIN users u ON j.admin_id = u.id
            WHERE j.id = $1
        `, [jobId]);

        if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// PUT /api/jobs/:id -> Admin only
router.put('/:id', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const jobId = req.params.id;
        const adminId = req.user.id;

        // Verify ownership
        const { rows: ownCheck } = await db.query('SELECT id FROM jobs WHERE id = $1 AND admin_id = $2', [jobId, adminId]);
        if (ownCheck.length === 0) return res.status(403).json({ error: 'You do not have permission to edit this job' });

        const {
            title, location, salary, job_type, description,
            company_name, company_website, company_description,
            experience_required, skills_required, number_of_openings,
            application_last_date, responsibilities, requirements, benefits
        } = req.body;

        if (!title || !location || !salary || !job_type || !description ||
            !company_name || !experience_required || !skills_required ||
            !number_of_openings || !application_last_date || !responsibilities || !requirements) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const { rows } = await db.query(`
            UPDATE jobs
            SET title = $1, location = $2, salary = $3, job_type = $4, description = $5,
                company_name = $6, company_website = $7, company_description = $8,
                experience_required = $9, skills_required = $10, number_of_openings = $11,
                application_last_date = $12, responsibilities = $13, requirements = $14, benefits = $15
            WHERE id = $16
            RETURNING *
        `, [
            title, location, salary, job_type, description,
            company_name, company_website, company_description,
            experience_required, skills_required, number_of_openings,
            application_last_date, responsibilities, requirements, benefits,
            jobId
        ]);

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// DELETE /api/jobs/:id -> Admin only
router.delete('/:id', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const jobId = req.params.id;
        const adminId = req.user.id;

        // Verify ownership
        const { rows: ownCheck } = await db.query('SELECT id FROM jobs WHERE id = $1 AND admin_id = $2', [jobId, adminId]);
        if (ownCheck.length === 0) return res.status(403).json({ error: 'You do not have permission to delete this job' });

        await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

module.exports = router;
