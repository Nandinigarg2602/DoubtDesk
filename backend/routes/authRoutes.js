const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { signupValidators, loginValidators } = require('../validators/authValidators');

router.post('/signup', signupValidators, signup);
router.post('/login', loginValidators, login);

module.exports = router;
