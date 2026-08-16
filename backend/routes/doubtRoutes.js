const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/auth');
const {
  createDoubt,
  getDoubts,
  getDoubt,
  assignDoubt,
  proposeResolution,
  verifyResolution,
  updateStatus,
} = require('../controllers/doubtController');
const { createDoubtValidators } = require('../validators/doubtValidators');

router.use(protect);

router.post('/', allowRoles('student'), createDoubtValidators, createDoubt);
router.get('/', getDoubts);
router.get('/:id', getDoubt);
router.put('/:id/assign', allowRoles('mentor'), assignDoubt);
router.put('/:id/propose-resolution', allowRoles('mentor'), proposeResolution);
router.put('/:id/verify-resolution', allowRoles('student'), verifyResolution);
router.put('/:id/status', allowRoles('mentor', 'admin'), updateStatus);

module.exports = router;
