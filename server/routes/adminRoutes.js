const express = require("express");
const router  = express.Router();
const db      = require("../db.js");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

// ── Admin auth middleware ──────────────────────────────────────
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rental10secret');
    if (!decoded.isAdmin) return res.status(403).json({ error: "Admin access required." });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
};

// ── Admin password login ───────────────────────────────────────
// POST /api/admin/login  { adminPassword }
router.post("/login", (req, res) => {
  const { adminPassword } = req.body;
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'rental10admin';
  if (adminPassword !== ADMIN_PASS) {
    return res.status(401).json({ error: "Invalid admin password." });
  }
  // Return a simple admin session token (24h)
  const token = jwt.sign(
    { isAdmin: true, role: 'admin' },
    process.env.JWT_SECRET || 'rental10secret',
    { expiresIn: '24h' }
  );
  res.json({ token });
});

// ── GET /api/admin/vehicles ────────────────────────────────────
// Returns all vehicles with their real-time status based on bookings
router.get("/vehicles", requireAdmin, async (req, res) => {
  try {
    const [vehicles] = await db.query(`
      SELECT
        v.*,
        vi.imageUrl,
        l.name AS locationName,
        -- Auto status based on active bookings
        CASE
          WHEN EXISTS (
            SELECT 1 FROM Bookings b
            WHERE b.vehicleId = v.id
              AND b.status = 'active'
          ) THEN 'rented'
          WHEN EXISTS (
            SELECT 1 FROM Bookings b
            WHERE b.vehicleId = v.id
              AND b.status IN ('pending','confirmed')
              AND b.startDate <= CURDATE()
              AND b.endDate >= CURDATE()
          ) THEN 'reserved'
          WHEN v.status = 'maintenance' THEN 'maintenance'
          WHEN v.status = 'inactive'    THEN 'inactive'
          ELSE 'available'
        END AS computedStatus
      FROM Vehicles v
      LEFT JOIN VehicleImages vi ON vi.vehicleId = v.id AND vi.isPrimary = TRUE
      LEFT JOIN Locations l ON l.id = v.locationId
      ORDER BY v.createdAt DESC
    `);
    res.json(vehicles);
  } catch (err) {
    console.error("GET /api/admin/vehicles error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /api/admin/locations ───────────────────────────────────
router.get("/locations", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name, city FROM Locations ORDER BY city`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── POST /api/admin/vehicles ───────────────────────────────────
// Create new vehicle
router.post("/vehicles", requireAdmin, async (req, res) => {
  const {
    make, model, year, category, transmission, fuelType,
    seats, color, plateNumber, mileage, dailyRate, locationId, imageUrl
  } = req.body;

  if (!make || !model || !year || !category || !plateNumber || !dailyRate) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const vehicleId = uuidv4();

    await connection.query(`
      INSERT INTO Vehicles (id, make, model, year, category, transmission, fuelType,
        seats, color, plateNumber, mileage, dailyRate, status, locationId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)
    `, [vehicleId, make, model, year, category, transmission, fuelType,
        seats || 5, color || null, plateNumber, mileage || 0, dailyRate, locationId || null]);

    if (imageUrl) {
      await connection.query(`
        INSERT INTO VehicleImages (id, vehicleId, imageUrl, isPrimary)
        VALUES (?, ?, ?, TRUE)
      `, [uuidv4(), vehicleId, imageUrl]);
    }

    await connection.commit();
    res.status(201).json({ message: "Vehicle created successfully.", vehicleId });
  } catch (err) {
    await connection.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "Plate number already exists." });
    }
    console.error("POST /api/admin/vehicles error:", err);
    res.status(500).json({ error: "Failed to create vehicle." });
  } finally {
    connection.release();
  }
});

// ── PUT /api/admin/vehicles/:id ────────────────────────────────
// Update vehicle details
router.put("/vehicles/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    make, model, year, category, transmission, fuelType,
    seats, color, plateNumber, mileage, dailyRate, status, locationId, imageUrl
  } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`
      UPDATE Vehicles SET
        make=?, model=?, year=?, category=?, transmission=?, fuelType=?,
        seats=?, color=?, plateNumber=?, mileage=?, dailyRate=?, status=?, locationId=?
      WHERE id=?
    `, [make, model, year, category, transmission, fuelType,
        seats, color, plateNumber, mileage, dailyRate, status, locationId, id]);

    if (imageUrl) {
      // Upsert primary image
      const [existing] = await connection.query(
        `SELECT id FROM VehicleImages WHERE vehicleId=? AND isPrimary=TRUE`, [id]
      );
      if (existing.length > 0) {
        await connection.query(
          `UPDATE VehicleImages SET imageUrl=? WHERE vehicleId=? AND isPrimary=TRUE`, [imageUrl, id]
        );
      } else {
        await connection.query(
          `INSERT INTO VehicleImages (id, vehicleId, imageUrl, isPrimary) VALUES (?,?,?,TRUE)`,
          [uuidv4(), id, imageUrl]
        );
      }
    }

    await connection.commit();
    res.json({ message: "Vehicle updated successfully." });
  } catch (err) {
    await connection.rollback();
    console.error("PUT /api/admin/vehicles error:", err);
    res.status(500).json({ error: "Failed to update vehicle." });
  } finally {
    connection.release();
  }
});

// ── DELETE /api/admin/vehicles/:id ────────────────────────────
router.delete("/vehicles/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Check if vehicle has active bookings
    const [active] = await db.query(`
      SELECT id FROM Bookings
      WHERE vehicleId=? AND status IN ('pending','confirmed','active')
    `, [id]);

    if (active.length > 0) {
      return res.status(409).json({ error: "Cannot delete vehicle with active bookings." });
    }

    await db.query(`DELETE FROM VehicleImages WHERE vehicleId=?`, [id]);
    await db.query(`DELETE FROM Vehicles WHERE id=?`, [id]);
    res.json({ message: "Vehicle deleted successfully." });
  } catch (err) {
    console.error("DELETE /api/admin/vehicles error:", err);
    res.status(500).json({ error: "Failed to delete vehicle." });
  }
});

module.exports = router;