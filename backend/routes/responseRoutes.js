const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createResponse, getResponses } = require('../controllers/responseController');
const { createResponseValidators } = require('../validators/responseValidators');

router.use(protect);

router.post('/:doubtId', createResponseValidators, createResponse);
router.get('/:doubtId', getResponses);

module.exports = router;
