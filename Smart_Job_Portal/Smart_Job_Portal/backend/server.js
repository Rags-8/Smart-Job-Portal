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

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CareerLens API is running' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong on the server!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
