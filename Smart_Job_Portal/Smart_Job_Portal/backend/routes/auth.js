const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Signup
router.post('/signup', async (req, res) => {
    try {
        // support either "name" or legacy "full_name" from older clients
        const name = req.body.name || req.body.full_name;
        let { email, password, role } = req.body;

        // normalize basic inputs
        email = email ? String(email).trim().toLowerCase() : '';
        role = role ? String(role).trim().toLowerCase() : '';

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required: name, email, password, role' });
        }

        // simple validation for allowed roles
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        // check for existing user by normalized email
        const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const { rows } = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, passwordHash, role]
        );
        const user = rows[0];

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (err) {
        console.error('Signup error:', err);
        // write to log so the dev can inspect later
        try {
            const fs = require('fs');
            fs.appendFileSync('auth_err.log', err.stack + '\n');
        } catch (writeErr) {
            console.error('Failed to write auth_err.log:', writeErr);
        }
        // don't leak raw error to client in production
        res.status(500).json({ error: 'Unable to create user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const { rows } = await db.query('SELECT id, name, email, password, role FROM users WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        // Remove password hash from the response
        delete user.password;

        res.json({ token, user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Middleware to verify JWT for protected routes
const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // Ensure user still exists
        const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.id]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid token user' });

        req.user = rows[0];
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }
};

// GET /api/auth/me → fetch full profile
router.get('/me', verifyAuth, async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id, name, email, role, profile_data FROM users WHERE id = $1',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const u = rows[0];
        res.json({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.profile_data?.phone || '',
            github_url: u.profile_data?.github_url || '',
            linkedin_url: u.profile_data?.linkedin_url || '',
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/auth/me → update profile
router.put('/me', verifyAuth, async (req, res) => {
    try {
        const { name, phone, github_url, linkedin_url } = req.body;
        const profileData = { phone: phone || '', github_url: github_url || '', linkedin_url: linkedin_url || '' };

        await db.query(
            'UPDATE users SET name = $1, profile_data = $2 WHERE id = $3',
            [name || req.user.name, profileData, req.user.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        // If profile_data column doesn't exist, handle gracefully
        if (err.code === '42703') {
            return res.status(500).json({ error: 'profile_data column missing. Run: ALTER TABLE users ADD COLUMN profile_data JSONB DEFAULT \'{}\';' });
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
module.exports.verifyAuth = verifyAuth;
module.exports.verifyAdmin = verifyAdmin;
