require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { startSLAMonitor } = require('./services/slaService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const doubtRoutes = require('./routes/doubtRoutes');
const responseRoutes = require('./routes/responseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const faqRoutes = require('./routes/faqRoutes');

const app = express();

// ── Security headers ──
app.use(helmet());

// ── CORS — allow all origins or client origin ──
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ── Body parser ──
app.use(express.json({ limit: '50kb' }));

// ── NoSQL injection protection ──
app.use(mongoSanitize());

// ── Rate limiters ──
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// ── Ensure DB Connection on each request in serverless environment ──
let dbConnected = false;
app.use(async (_req, _res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (e) {
      console.error('DB connect error:', e.message);
    }
  }
  next();
});

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/faq', faqRoutes);

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Centralized error handler ──
app.use(errorHandler);

// ── Start server when run directly (local / container) ──
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      startSLAMonitor();
    });
  }).catch((err) => {
    console.error('Failed to start server:', err.message);
  });
}

// ── Export app for Vercel Serverless Function ──
module.exports = app;
