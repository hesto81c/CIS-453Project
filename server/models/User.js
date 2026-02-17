const db = require('../config/db');

class User {
  // Create user record
    static async create(userData) {
    const { email, passwordHash, firstName, lastName, driverLicense, phone } = userData;

    const sql = `
        INSERT INTO Users (email, passwordHash, firstName, lastName, driverLicense, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
        email,
        passwordHash,
        firstName ?? null,
        lastName ?? null,
        driverLicense ?? null,
        phone ?? null
    ];

    const [result] = await db.execute(sql, params);
    return result; // result.insertId
    }


  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM Users WHERE email = ?';
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  }
}

module.exports = User;
