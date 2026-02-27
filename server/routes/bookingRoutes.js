const express  = require("express");
const router   = express.Router();
const db       = require("../db.js");
const { v4: uuidv4 } = require("uuid");
const jwt      = require("jsonwebtoken");

// ── Auth middleware ───────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token provided." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'rental10secret');
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/bookings/booked-dates/:vehicleId
// ─────────────────────────────────────────────────────────────
router.get("/booked-dates/:vehicleId", async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT startDate, endDate FROM Bookings
      WHERE vehicleId = ? AND status IN ('pending','confirmed','active')
    `, [vehicleId]);
    res.json(rows);
  } catch (err) {
    console.error("GET /booked-dates error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/bookings/locations
// ─────────────────────────────────────────────────────────────
router.get("/locations", async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name, city, address FROM Locations ORDER BY city`);
    res.json(rows);
  } catch (err) {
    console.error("GET /locations error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/bookings/my-bookings  — user's booking history
// ─────────────────────────────────────────────────────────────
router.get("/my-bookings", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        b.id, b.confirmationNumber, b.startDate, b.endDate,
        b.totalAmount, b.status, b.bookedAt, b.paymentMethod,
        b.pickupTime, b.dropoffTime,
        v.make, v.model, v.year, v.category,
        vi.imageUrl,
        pl.name  AS pickupLocation,
        dl.name  AS dropoffLocation,
        p.status AS paymentStatus, p.transactionId
      FROM Bookings b
      LEFT JOIN Vehicles      v  ON b.vehicleId         = v.id
      LEFT JOIN VehicleImages vi ON vi.vehicleId        = v.id AND vi.isPrimary = 1
      LEFT JOIN Locations     pl ON b.pickupLocationId  = pl.id
      LEFT JOIN Locations     dl ON b.dropoffLocationId = dl.id
      LEFT JOIN Payments      p  ON p.bookingId         = b.id
      WHERE b.userId = ?
      ORDER BY b.bookedAt DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error("GET /my-bookings error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/bookings/:id/cancel  — cancel a booking
// ─────────────────────────────────────────────────────────────
router.post("/:id/cancel", requireAuth, async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify booking belongs to user and is cancellable
    const [rows] = await connection.query(
      `SELECT id, vehicleId, status, startDate FROM Bookings WHERE id = ? AND userId = ?`,
      [id, req.user.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Booking not found." });

    const booking = rows[0];

    if (!['pending','confirmed'].includes(booking.status))
      return res.status(400).json({ error: "This booking cannot be cancelled." });

    // Don't allow cancellation if trip already started
    if (new Date(booking.startDate) <= new Date()) {
      await connection.rollback();
      return res.status(400).json({ error: "Cannot cancel a booking that has already started." });
    }

    // Cancel booking
    await connection.query(
      `UPDATE Bookings SET status = 'cancelled' WHERE id = ?`, [id]
    );

    // Cancel payment
    await connection.query(
      `UPDATE Payments SET status = 'cancelled' WHERE bookingId = ?`, [id]
    );

    // Free the vehicle back to available
    await connection.query(
      `UPDATE Vehicles SET status = 'available' WHERE id = ?`, [booking.vehicleId]
    );

    await connection.commit();
    res.json({ message: "Booking cancelled successfully." });

  } catch (err) {
    await connection.rollback();
    console.error("POST /cancel error:", err);
    res.status(500).json({ error: "Failed to cancel booking." });
  } finally {
    connection.release();
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/bookings  — create booking
// ─────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const {
    vehicleId, userId,
    startDate, endDate,
    pickupLocationId, dropoffLocationId,
    pickupTime, dropoffTime,
    totalAmount, paymentMethod,
    driverName, driverLicense, driverPhone, notes
  } = req.body;

  if (!vehicleId || !startDate || !endDate || !totalAmount || !paymentMethod)
    return res.status(400).json({ error: "Missing required fields." });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Conflict check
    const [conflicts] = await connection.query(`
      SELECT id FROM Bookings
      WHERE vehicleId = ? AND status IN ('pending','confirmed','active')
        AND NOT (endDate < ? OR startDate > ?)
    `, [vehicleId, startDate, endDate]);

    if (conflicts.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: "Vehicle is no longer available for the selected dates." });
    }

    const bookingId          = uuidv4();
    const confirmationNumber = `RNT-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const paymentId          = uuidv4();

    await connection.query(`
      INSERT INTO Bookings (
        id, userId, vehicleId, pickupLocationId, dropoffLocationId,
        startDate, endDate, pickupTime, dropoffTime,
        totalAmount, status, confirmationNumber, notes, bookedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())
    `, [
      bookingId, userId || 'guest', vehicleId,
      pickupLocationId || null, dropoffLocationId || null,
      startDate, endDate, pickupTime || null, dropoffTime || null,
      totalAmount, confirmationNumber, notes || null
    ]);

    await connection.query(`
      INSERT INTO Payments (id, bookingId, amount, currency, method, status, processedAt)
      VALUES (?, ?, ?, 'USD', ?, 'pending', NOW())
    `, [paymentId, bookingId, totalAmount, paymentMethod]);

    await connection.query(
      `UPDATE Vehicles SET status = 'reserved' WHERE id = ?`, [vehicleId]
    );

    await connection.commit();

    res.status(201).json({ message: "Booking created successfully!", bookingId, confirmationNumber });

  } catch (err) {
    await connection.rollback();
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ error: "Failed to create booking." });
  } finally {
    connection.release();
  }
});

module.exports = router;