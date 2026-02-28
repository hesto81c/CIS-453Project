const express    = require("express");
const router     = express.Router();
const db         = require("../db.js");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ─────────────────────────────────────────────────────────────
//  GET /api/payments/booking/:bookingId
// ─────────────────────────────────────────────────────────────
router.get("/booking/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        b.id,
        b.confirmationNumber,
        b.startDate,
        b.endDate,
        b.totalAmount,
        b.status AS bookingStatus,
        v.make,
        v.model,
        v.year,
        vi.imageUrl,
        p.id     AS paymentId,
        p.amount,
        p.method,
        p.status AS paymentStatus
      FROM Bookings b
      LEFT JOIN Vehicles      v  ON b.vehicleId  = v.id
      LEFT JOIN VehicleImages vi ON vi.vehicleId = v.id AND vi.isPrimary = 1
      LEFT JOIN Payments      p  ON p.bookingId  = b.id
      WHERE b.id = ?
    `, [bookingId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found." });
    }
    res.json(rows[0]);

  } catch (err) {
    console.error("GET /api/payments/booking error:", err.message);
    res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/payments/process/:bookingId
// ─────────────────────────────────────────────────────────────
router.post("/process/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get booking + user info for confirmation email
    const [bookings] = await connection.query(`
      SELECT
        b.id,
        b.totalAmount,
        b.confirmationNumber,
        b.startDate,
        b.endDate,
        v.make,
        v.model,
        v.year,
        u.email,
        u.firstName,
        pl.name AS pickupLocation
      FROM Bookings b
      LEFT JOIN Vehicles  v  ON b.vehicleId       = v.id
      LEFT JOIN Users     u  ON b.userId           = u.id
      LEFT JOIN Locations pl ON b.pickupLocationId = pl.id
      WHERE b.id = ? AND b.status = 'pending'
    `, [bookingId]);

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Booking not found or already processed." });
    }

    const booking       = bookings[0];
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

    // 2. Update Payment record
    await connection.query(`
      UPDATE Payments
      SET status = 'completed', transactionId = ?, processedAt = NOW()
      WHERE bookingId = ?
    `, [transactionId, bookingId]);

    // 3. Update Booking to confirmed
    await connection.query(
      `UPDATE Bookings SET status = 'confirmed' WHERE id = ?`,
      [bookingId]
    );

    await connection.commit();

    // 4. Send confirmation email (non-blocking — failure won't break payment)
    if (booking.email) {
      const fmt = (d) => new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      transporter.sendMail({
        from:    `"Rental 10" <${process.env.EMAIL_USER}>`,
        to:      booking.email,
        subject: `Booking Confirmed — ${booking.confirmationNumber}`,
        html: `
<div style="font-family:Arial,sans-serif;background:#050508;color:#f0f2f8;padding:40px;max-width:560px;margin:0 auto;border-radius:6px;">
  <div style="border-top:2px solid #9b1c31;margin-bottom:28px;"></div>
  <h1 style="font-family:Georgia,serif;color:#f0f2f8;letter-spacing:4px;font-size:1.6rem;margin:0 0 4px;">
    RENTAL <span style="color:#9b1c31;">10</span>
  </h1>
  <p style="color:#4a5060;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 32px;">Booking Confirmation</p>
  <h2 style="color:#4ade80;font-family:Georgia,serif;font-size:1.3rem;letter-spacing:2px;margin:0 0 8px;">&#10003; BOOKING CONFIRMED</h2>
  <p style="color:#c8cdd6;margin:0 0 28px;">Hi ${booking.firstName || 'there'}, your reservation is confirmed. See you soon!</p>
  <div style="background:#0e0e14;border:1px solid #1e1e2e;border-left:3px solid #9b1c31;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
    <p style="color:#4a5060;font-size:10px;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase;">Confirmation Number</p>
    <p style="color:#f0f2f8;font-size:1.2rem;font-weight:700;letter-spacing:3px;font-family:monospace;margin:0;">${booking.confirmationNumber}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#4a5060;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:140px;">Vehicle</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#f0f2f8;font-size:13px;">${booking.year} ${booking.make} ${booking.model}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#4a5060;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Pick-up</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#f0f2f8;font-size:13px;">${fmt(booking.startDate)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#4a5060;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Drop-off</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#f0f2f8;font-size:13px;">${fmt(booking.endDate)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#4a5060;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Location</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#f0f2f8;font-size:13px;">${booking.pickupLocation || 'See confirmation'}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#4a5060;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Total Paid</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#f0f2f8;font-size:13px;">$${Number(booking.totalAmount).toFixed(2)} USD</td>
    </tr>
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#4a5060;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Transaction</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#f0f2f8;font-size:13px;font-family:monospace;">${transactionId}</td>
    </tr>
  </table>
  <p style="color:#4a5060;font-size:12px;line-height:1.8;margin-bottom:24px;">
    Please bring this confirmation number and a valid ID when picking up your vehicle.
  </p>
  <div style="border-top:1px solid #1e1e2e;padding-top:16px;">
    <p style="color:#3a3a50;font-size:11px;margin:0;">&#169; 2026 Rental 10 &middot; Syracuse, NY</p>
  </div>
</div>`,
      }).catch(e => console.error('Confirmation email error:', e.message));
    }

    res.json({ success: true, transactionId, message: "Payment processed successfully." });

  } catch (err) {
    await connection.rollback();
    console.error("POST /api/payments/process error:", err.message);
    res.status(500).json({ error: "Payment processing failed.", detail: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;