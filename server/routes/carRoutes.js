const express = require("express");
const router  = express.Router();
const db      = require("../db.js"); 

// ─────────────────────────────────────────────────────────────
//  GET /api/cars
//  Returns all vehicles with their primary image (for Catalog.js)
// ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        v.id, v.make, v.model, v.year, v.category,
        v.transmission, v.fuelType, v.seats, v.color,
        v.plateNumber, v.mileage, v.dailyRate, v.status,
        vi.imageUrl
      FROM Vehicles v
      LEFT JOIN VehicleImages vi ON vi.vehicleId = v.id AND vi.isPrimary = TRUE
      WHERE v.status != 'inactive'
      ORDER BY v.createdAt DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/cars error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/cars/:id
//  Returns full vehicle details + location + reviews
//  Called by CarDetails.js when user clicks DETAILS
// ─────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Vehicle + Location
    const [rows] = await db.query(`
      SELECT
        v.id, v.make, v.model, v.year, v.category,
        v.transmission, v.fuelType, v.seats, v.color,
        v.plateNumber, v.mileage, v.dailyRate, v.status,
        l.name    AS locationName,
        l.address AS locationAddress,
        l.city    AS locationCity,
        l.phone   AS locationPhone,
        vi.imageUrl
      FROM Vehicles v
      LEFT JOIN Locations l ON v.locationId = l.id
      LEFT JOIN VehicleImages vi ON vi.vehicleId = v.id AND vi.isPrimary = TRUE
      WHERE v.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // 2. Reviews for this vehicle
    const [reviews] = await db.query(`
      SELECT
        CONCAT(u.firstName, ' ', LEFT(u.lastName, 1), '.') AS author,
        r.rating,
        r.comment,
        r.createdAt
      FROM Reviews r
      JOIN Users u ON u.id = r.userId
      WHERE r.vehicleId = ?
      ORDER BY r.createdAt DESC
      LIMIT 10
    `, [id]);

    // 3. Combine and send
    res.json({ ...rows[0], reviews });

  } catch (err) {
    console.error(`GET /api/cars/${id} error:`, err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/cars/:id/availability
//  Returns count of available units for same make/model/year
// ─────────────────────────────────────────────────────────────
router.get("/:id/availability", async (req, res) => {
  const { id } = req.params;
  try {
    // Get the model info for this vehicle
    const [vehicle] = await db.query(
      `SELECT make, model, year FROM Vehicles WHERE id = ?`, [id]
    );
    if (!vehicle.length) return res.status(404).json({ error: "Vehicle not found" });

    const { make, model, year } = vehicle[0];

    // Count all units of same make/model/year and their statuses
    const [units] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE
          WHEN EXISTS (
            SELECT 1 FROM Bookings b
            WHERE b.vehicleId = v.id
            AND b.status IN ('confirmed','pending')
            AND CURDATE() BETWEEN b.startDate AND b.endDate
          ) THEN 1 ELSE 0 END) as rented,
        SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN v.status = 'inactive'    THEN 1 ELSE 0 END) as inactive
      FROM Vehicles v
      WHERE v.make = ? AND v.model = ? AND v.year = ?
    `, [make, model, year]);

    const total       = units[0].total       || 0;
    const rented      = units[0].rented      || 0;
    const maintenance = units[0].maintenance || 0;
    const inactive    = units[0].inactive    || 0;
    const available   = total - rented - maintenance - inactive;

    res.json({ total, available: Math.max(0, available), rented, maintenance });
  } catch (err) {
    console.error(`GET /api/cars/${id}/availability error:`, err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;