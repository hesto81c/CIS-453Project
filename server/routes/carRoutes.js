const express = require('express');
const router = express.Router();
const carController = require('../controllers/CarController');

// Ruta para obtener todos los autos (FR2)
// GET /api/cars
router.get('/', carController.getCars);

// Ruta para filtrar por categoría (FR2)
// GET /api/cars/category/:category
router.get('/category/:category', carController.getCarsByCategory);

// Ruta para verificar disponibilidad de un auto específico (FR3)
// GET /api/cars/status/:id
router.get('/status/:id', carController.checkCarStatus);

module.exports = router;