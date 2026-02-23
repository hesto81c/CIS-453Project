const express = require("express");
const router  = express.Router();
const db      = require("../db.js");

// ─────────────────────────────────────────────────────────────
//  GET /api/payments/booking/:bookingId
//  Returns booking + payment info for the payment page
// ─────────────────────────────────────────────────────────────
router.get("/booking/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        b.id AS bookingId, b.confirmationNumber, b.totalAmount,
        b.startDate, b.endDate, b.status AS bookingStatus,
        v.make, v.model, v.year,
        p.id AS paymentId, p.method, p.status AS paymentStatus, p.amount
      FROM Bookings b
      JOIN Vehicles v ON v.id = b.vehicleId
      JOIN Payments p ON p.bookingId = b.id
      WHERE b.id = ?
    `, [bookingId]);

    if (rows.length === 0) return res.status(404).json({ error: "Booking not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/payments/booking error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/payments/process/:bookingId
//  Processes the payment — updates Payment + Booking in DB
//  Body: { cardName, cardNumber (last4), expiry, method }
// ─────────────────────────────────────────────────────────────
router.post("/process/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const { cardName, last4, method } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verify booking exists and is still pending
    const [bookings] = await connection.query(
      `SELECT id, totalAmount FROM Bookings WHERE id = ? AND status = 'pending'`,
      [bookingId]
    );
    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Booking not found or already processed." });
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

    // 2. Update Payment to completed
    await connection.query(`
      UPDATE Payments
      SET status = 'completed', transactionId = ?, processedAt = NOW()
      WHERE bookingId = ?
    `, [transactionId, bookingId]);

    // 3. Update Booking to confirmed
    await connection.query(`
      UPDATE Bookings SET status = 'confirmed' WHERE id = ?
    `, [bookingId]);

    await connection.commit();

    res.json({
      success: true,
      transactionId,
      message: "Payment processed successfully.",
    });

  } catch (err) {
    await connection.rollback();
    console.error("POST /api/payments/process error:", err);
    res.status(500).json({ error: "Payment processing failed." });
  } finally {
    connection.release();
  }
});

module.exports = router;