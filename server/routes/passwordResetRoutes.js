const express  = require('express');
const router   = express.Router();
const db       = require('../db.js');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const nodemailer = require('nodemailer');

// ── Nodemailer transporter ────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (16 chars)
  },
});

// ─────────────────────────────────────────────────────────────
//  POST /api/reset/request
//  User submits their email → we send a reset link
// ─────────────────────────────────────────────────────────────
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const [rows] = await db.query(
      `SELECT id, firstName FROM Users WHERE email = ?`, [email]
    );

    // Always respond the same way — don't reveal if email exists
    if (rows.length === 0) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const user  = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token + expiry to DB
    await db.query(
      `UPDATE Users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?`,
      [token, expiry, user.id]
    );

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await transporter.sendMail({
      from:    `"Rental 10" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Password Reset — Rental 10',
      html: `
        <div style="font-family: Arial, sans-serif; background: #050508; color: #f0f2f8; padding: 40px; max-width: 520px; margin: 0 auto; border-radius: 6px;">
          <div style="border-top: 2px solid #9b1c31; margin-bottom: 32px;"></div>
          <h1 style="font-family: Georgia, serif; color: #f0f2f8; letter-spacing: 4px; font-size: 1.6rem; margin: 0 0 8px;">RENTAL <span style="color:#9b1c31;">10</span></h1>
          <p style="color: #8a909e; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 32px;">Password Reset Request</p>
          <p style="color: #c8cdd6; line-height: 1.7;">Hi ${user.firstName},</p>
          <p style="color: #c8cdd6; line-height: 1.7;">We received a request to reset your password. Click the button below to set a new one. This link expires in <strong style="color:#f0f2f8;">1 hour</strong>.</p>
          <div style="text-align: center; margin: 36px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg,#9b1c31,#7a1526); color: #f0f2f8; text-decoration: none; padding: 14px 32px; border-radius: 2px; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">
              RESET PASSWORD
            </a>
          </div>
          <p style="color: #4a5060; font-size: 12px; line-height: 1.7;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
          <div style="border-top: 1px solid #1e1e2e; margin-top: 32px; padding-top: 16px;">
            <p style="color: #3a3a50; font-size: 11px; margin: 0;">© 2026 Rental 10 · Syracuse, NY</p>
          </div>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });

  } catch (err) {
    console.error('POST /api/reset/request error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
//  POST /api/reset/confirm
//  User submits token + new password
// ─────────────────────────────────────────────────────────────
router.post('/confirm', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: 'Token and new password are required.' });

  if (newPassword.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  try {
    const [rows] = await db.query(
      `SELECT id FROM Users WHERE resetToken = ? AND resetTokenExpiry > NOW()`, [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE Users SET passwordHash = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?`,
      [passwordHash, rows[0].id]
    );

    res.json({ message: 'Password updated successfully. You can now log in.' });

  } catch (err) {
    console.error('POST /api/reset/confirm error:', err);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
});

module.exports = router;