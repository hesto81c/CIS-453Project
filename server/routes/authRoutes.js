const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Route for User Registration (FR1)
// POST /api/auth/register
router.post('/register', authController.register);

// Route for User Login (FR1)
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;