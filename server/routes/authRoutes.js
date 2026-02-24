const express = require("express");
const router  = express.Router();
const db      = require("../db.js");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

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
//  POST /api/auth/register
// ─────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, phone, driverLicense } = req.body;
  if (!email || !password || !firstName)
    return res.status(400).json({ message: "Email, password and first name are required." });

  try {
    const [existing] = await db.query(`SELECT id FROM Users WHERE email = ?`, [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: "An account with this email already exists." });

    const id           = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(`
      INSERT INTO Users (id, email, passwordHash, firstName, lastName, phone, driverLicense, isVerified, isAdmin)
      VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)
    `, [id, email, passwordHash, firstName, lastName || null, phone || null, driverLicense || null]);

    res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    const [rows] = await db.query(
      `SELECT id, email, passwordHash, firstName, lastName, isAdmin FROM Users WHERE email = ?`, [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password." });

    const user  = rows[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'rental10secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin }
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/auth/profile  — fetch full profile
// ─────────────────────────────────────────────────────────────
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, email, firstName, lastName, phone, driverLicense, profilePhoto, isAdmin
       FROM Users WHERE id = ?`, [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/auth/profile error:", err);
    res.status(500).json({ message: "Failed to load profile." });
  }
});

// ─────────────────────────────────────────────────────────────
//  PUT /api/auth/profile  — update profile
// ─────────────────────────────────────────────────────────────
router.put("/profile", requireAuth, async (req, res) => {
  const { firstName, lastName, phone, driverLicense, profilePhoto } = req.body;
  if (!firstName) return res.status(400).json({ message: "First name is required." });

  try {
    await db.query(`
      UPDATE Users
      SET firstName=?, lastName=?, phone=?, driverLicense=?, profilePhoto=?
      WHERE id=?
    `, [firstName, lastName || null, phone || null, driverLicense || null, profilePhoto || null, req.user.id]);

    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error("PUT /api/auth/profile error:", err);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

module.exports = router;