const express = require('express');
const router = express.Router();
const { getFAQs, voteHelpful, getFAQStats } = require('../controllers/faqController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFAQs);
router.get('/stats', protect, getFAQStats);
router.post('/:id/helpful', protect, voteHelpful);

module.exports = router;
