const express = require('express');
const router = express.Router();
const carController = require('../controllers/CarController');

// Route to get all the cars (FR2)
// GET /api/cars
router.get('/', carController.getCars);

// Route to filter by category (FR2)
// GET /api/cars/category/:category
router.get('/category/:category', carController.getCarsByCategory);

// Route to check availability of a specific car (FR3)
// GET /api/cars/status/:id
router.get('/status/:id', carController.checkCarStatus);

module.exports = router;