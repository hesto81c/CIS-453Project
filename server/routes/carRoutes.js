// server/routes/carRoutes.js
const express = require('express');
const router = express.Router();

// Using the explicit extension .js helps Node find the file sometimes
const db = require('../db.js'); 

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT v.id, v.make, v.model, v.dailyRate, i.imageUrl
            FROM Vehicles v
            LEFT JOIN VehicleImages i ON v.id = i.vehicleId
        `);
        console.log("Cars found in DB:", rows.length);
        res.status(200).json(rows);
    } catch (error) {
        console.error('SERVER ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;