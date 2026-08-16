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

// ── CORS — locked to explicit allowlist ──
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

// ── Start ──
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    startSLAMonitor();
  });
});
