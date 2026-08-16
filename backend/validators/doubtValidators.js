const { body } = require('express-validator');

const createDoubtValidators = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 140 })
    .withMessage('Title must be 3-140 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 4000 })
    .withMessage('Description must be 10-4000 characters'),
  body('subject')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Subject must be 2-60 characters'),
];

module.exports = { createDoubtValidators };
