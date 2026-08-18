const express = require('express');
const router = express.Router();
const {
  analyzeDoubt,
  chatWithBot,
  explainCode,
  getSimilarDoubts,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Protected AI endpoints (Student & Auth required)
router.post('/analyze', protect, analyzeDoubt);
router.post('/chat', protect, chatWithBot);
router.post('/explain', protect, explainCode);
router.get('/similar', protect, getSimilarDoubts);

module.exports = router;
