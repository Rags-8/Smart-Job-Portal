require('dotenv').config();
require('./db');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const resumesRoutes = require('./routes/resumes');
const aiRoutes = require('./routes/ai');
const { startScheduler } = require('./cron/emailScheduler');

const app = express();
const port = process.env.PORT || 5000;

// Start background workers
startScheduler();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root Health Check (to verify backend is alive)
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'CareerLens API is online' });
});

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CareerLens API is running' });
});

// Test Email Route (Temporary for debugging)
const { sendEmail } = require('./utils/emailService');
app.get('/api/test-email', async (req, res) => {
    const testRecipient = req.query.to || process.env.SMTP_USER;
    if (!testRecipient) return res.status(400).json({ error: "Missing recipient" });

    console.log(`[TEST] Triggering test email to: ${testRecipient}`);
    const success = await sendEmail(
        testRecipient,
        "Test Email from Smart Job Portal",
        "<h2>It works!</h2><p>This is a test email triggered from the CareerLens API logs debugging session.</p>"
    );

    if (success) {
        res.json({ message: `Test email sent successfully to ${testRecipient}` });
    } else {
        res.status(500).json({ error: "Failed to send test email. Check Render logs for details." });
    }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/ai', aiRoutes);

// 404 Catch-all (to log what URLs are missing)
app.use((req, res, next) => {
    console.log(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route not found: ${req.url}` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong on the server!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
