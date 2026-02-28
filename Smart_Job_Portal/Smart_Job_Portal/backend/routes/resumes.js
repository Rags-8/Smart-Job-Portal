const express = require('express');
const router = express.Router();
const { verifyAuth } = require('./auth');
const db = require('../db');

// GET /api/resumes/my -> Fetch logged-in user's resume
router.get('/my', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT resume_data FROM user_resumes WHERE user_id = $1',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        res.json(rows[0].resume_data);
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ error: 'Failed to fetch resume profile' });
    }
});

// POST /api/resumes -> Create or Update user's resume
router.post('/', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        let resumeData = req.body;

        if (resumeData && resumeData.resumeData) {
            resumeData = resumeData.resumeData;
        }

        if (!resumeData || Object.keys(resumeData).length === 0) {
            return res.status(400).json({ error: 'Resume data is required' });
        }

        // Upsert logic
        const { rows } = await db.query(`
            INSERT INTO user_resumes (user_id, resume_data, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id) DO UPDATE 
            SET resume_data = EXCLUDED.resume_data, updated_at = NOW()
            RETURNING resume_data
        `, [userId, resumeData]);

        res.status(200).json({ message: 'Profile saved successfully', data: rows[0].resume_data });
    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).json({ error: 'Failed to save resume profile' });
    }
});

// DELETE /api/resumes -> Delete user's resume
router.delete('/', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rowCount } = await db.query(
            'DELETE FROM user_resumes WHERE user_id = $1',
            [userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'No resume profile found to delete' });
        }

        res.json({ message: 'Resume profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ error: 'Failed to delete resume profile' });
    }
});

module.exports = router;
