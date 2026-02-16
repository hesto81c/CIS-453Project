const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Login path (FR1)
router.post('/login', authController.login);

module.exports = router;