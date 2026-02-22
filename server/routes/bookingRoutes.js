const express = require("express");
const router  = express.Router();
const db      = require("../db.js");
const { v4: uuidv4 } = require("uuid");

// ─────────────────────────────────────────────────────────────
//  GET /api/bookings/booked-dates/:vehicleId
//  Returns all date ranges already booked for a vehicle
//  Used by the calendar to block unavailable days
// ─────────────────────────────────────────────────────────────
router.get("/booked-dates/:vehicleId", async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT startDate, endDate
      FROM Bookings
      WHERE vehicleId = ?
        AND status IN ('pending', 'confirmed', 'active')
    `, [vehicleId]);
    res.json(rows);
  } catch (err) {
    console.error("GET /booked-dates error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/bookings/locations
//  Returns all pickup/dropoff locations for the selectors
// ─────────────────────────────────────────────────────────────
router.get("/locations", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, city, address FROM Locations ORDER BY city
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /locations error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/bookings
//  Creates a new booking and inserts into DB
//  Body: { vehicleId, userId, startDate, endDate, pickupLocationId,
//          dropoffLocationId, pickupTime, dropoffTime,
//          totalAmount, paymentMethod, driverName, driverLicense,
//          driverPhone, notes }
// ─────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const {
    vehicleId, userId,
    startDate, endDate,
    pickupLocationId, dropoffLocationId,
    pickupTime, dropoffTime,
    totalAmount,
    paymentMethod,
    driverName, driverLicense, driverPhone,
    notes
  } = req.body;

  // Basic validation
  if (!vehicleId || !startDate || !endDate || !totalAmount || !paymentMethod) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Double-check the vehicle is still available for those dates
    const [conflicts] = await connection.query(`
      SELECT id FROM Bookings
      WHERE vehicleId = ?
        AND status IN ('pending', 'confirmed', 'active')
        AND NOT (endDate < ? OR startDate > ?)
    `, [vehicleId, startDate, endDate]);

    if (conflicts.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: "Vehicle is no longer available for the selected dates." });
    }

    // 2. Generate IDs
    const bookingId         = uuidv4();
    const confirmationNumber = `RNT-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const paymentId         = uuidv4();

    // 3. Insert Booking
    await connection.query(`
      INSERT INTO Bookings (
        id, userId, vehicleId,
        pickupLocationId, dropoffLocationId,
        startDate, endDate, pickupTime, dropoffTime,
        totalAmount, status, confirmationNumber, notes, bookedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())
    `, [
      bookingId,
      userId || 'guest',
      vehicleId,
      pickupLocationId || null,
      dropoffLocationId || null,
      startDate, endDate,
      pickupTime || null,
      dropoffTime || null,
      totalAmount,
      confirmationNumber,
      notes || null
    ]);

    // 4. Insert Payment record
    await connection.query(`
      INSERT INTO Payments (
        id, bookingId, amount, currency, method, status, processedAt
      ) VALUES (?, ?, ?, 'USD', ?, 'pending', NOW())
    `, [paymentId, bookingId, totalAmount, paymentMethod]);

    // 5. Update vehicle status to 'reserved'
    await connection.query(`
      UPDATE Vehicles SET status = 'reserved' WHERE id = ?
    `, [vehicleId]);

    await connection.commit();

    res.status(201).json({
      message: "Booking created successfully!",
      bookingId,
      confirmationNumber,
    });

  } catch (err) {
    await connection.rollback();
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ error: "Failed to create booking." });
  } finally {
    connection.release();
  }
});

module.exports = router;
