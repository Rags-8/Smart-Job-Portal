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

module.exports = router;
module.exports.verifyAuth = verifyAuth;
module.exports.verifyAdmin = verifyAdmin;
