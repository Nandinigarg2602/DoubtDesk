const { body } = require('express-validator');

const createResponseValidators = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be 1-2000 characters'),
];

module.exports = { createResponseValidators };
