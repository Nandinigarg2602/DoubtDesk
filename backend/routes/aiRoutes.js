const express = require('express');
const router = express.Router();
const {
  analyzeDoubt,
  chatWithBot,
  explainCode,
  getSimilarDoubts,
} = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

// Protected & open AI endpoints
router.post('/analyze', protect, analyzeDoubt);
router.post('/chat', optionalAuth, chatWithBot);
router.post('/explain', protect, explainCode);
router.get('/similar', protect, getSimilarDoubts);

module.exports = router;
