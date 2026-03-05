const express = require('express');
const router = express.Router();
const { verifyAuth } = require('./auth');
const db = require('../db');

// GET /api/resumes/my -> Fetch logged-in user's latest resume (for profile compat)
router.get('/my', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT resume_data FROM user_resumes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(200).json(null);
        }

        res.json(rows[0].resume_data);
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ error: 'Failed to fetch resume profile' });
    }
});

// GET /api/resumes -> Fetch all resumes for the logged-in user
router.get('/', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT id, resume_data, updated_at FROM user_resumes WHERE user_id = $1 ORDER BY updated_at DESC',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all resumes:', error);
        res.status(500).json({ error: 'Failed to fetch resume history' });
    }
});

// POST /api/resumes -> Create a NEW resume entry (Save history)
router.post('/', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        let resumeData = req.body;
        console.log('[DEBUG] Saving resume for user:', userId);

        if (resumeData && resumeData.resumeData) {
            resumeData = resumeData.resumeData;
        }

        if (!resumeData || Object.keys(resumeData).length === 0) {
            console.log('[DEBUG] Empty resume data received');
            return res.status(400).json({ error: 'Resume data is required' });
        }

        // Just insert, no conflict check (migration removed unique constraint)
        const { rows } = await db.query(`
            INSERT INTO user_resumes (user_id, resume_data, updated_at)
            VALUES ($1, $2, NOW())
            RETURNING id, resume_data, updated_at
        `, [userId, resumeData]);

        console.log('[DEBUG] Resume saved successfully, ID:', rows[0].id);
        res.status(200).json({ message: 'Resume version saved successfully', data: rows[0] });
    } catch (error) {
        console.error('[DEBUG] Error saving resume:', error);
        res.status(500).json({ error: 'Failed to save resume version' });
    }
});

// DELETE /api/resumes/:id -> Delete a specific resume version
router.delete('/:id', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const resumeId = req.params.id;
        const { rowCount } = await db.query(
            'DELETE FROM user_resumes WHERE id = $1 AND user_id = $2',
            [resumeId, userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Resume version not found' });
        }

        res.json({ message: 'Resume version deleted' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ error: 'Failed to delete resume' });
    }
});

// GET /api/resumes/:id -> Fetch a specific resume version
router.get('/:id', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const resumeId = req.params.id;
        const { rows } = await db.query(
            'SELECT resume_data FROM user_resumes WHERE id = $1 AND user_id = $2',
            [resumeId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Resume version not found' });
        }

        res.json(rows[0].resume_data);
    } catch (error) {
        console.error('Error fetching resume version:', error);
        res.status(500).json({ error: 'Failed to fetch resume version' });
    }
});

// PUT /api/resumes/:id -> Update a specific resume version
router.put('/:id', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const resumeId = req.params.id;
        let resumeData = req.body;

        if (resumeData && resumeData.resumeData) {
            resumeData = resumeData.resumeData;
        }

        const { rowCount } = await db.query(
            'UPDATE user_resumes SET resume_data = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [resumeData, resumeId, userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Resume version not found' });
        }

        res.json({ message: 'Resume updated successfully' });
    } catch (error) {
        console.error('Error updating resume:', error);
        res.status(500).json({ error: 'Failed to update resume' });
    }
});

module.exports = router;
