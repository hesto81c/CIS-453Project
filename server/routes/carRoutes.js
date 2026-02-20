// server/routes/carRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        // SQL Join to get the car info + its primary image
        const [rows] = await db.execute(`
            SELECT v.id, v.make, v.model, v.dailyRate, v.transmission, v.fuelType, v.category, i.imageUrl
            FROM Vehicles v
            LEFT JOIN VehicleImages i ON v.id = i.vehicleId
            WHERE i.isPrimary = TRUE OR i.isPrimary IS NULL
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching fleet:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;