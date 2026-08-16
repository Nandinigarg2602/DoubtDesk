const { body } = require('express-validator');

const signupValidators = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one digit'),
  body('role')
    .optional()
    .isIn(['student', 'mentor'])
    .withMessage('Role must be student or mentor'),
  body('expertise')
    .optional()
    .isArray()
    .withMessage('Expertise must be an array'),
];

const loginValidators = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = { signupValidators, loginValidators };
