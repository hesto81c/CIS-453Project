const db = require('../config/db');

class User {
    // Method to create a new user (Registration - FR1)
    static async create(userData) {
        const { id, email, passwordHash, firstName, lastName, driverLicense, phone } = userData;
        const sql = `
            INSERT INTO Users (id, email, passwordHash, firstName, lastName, driverLicense, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return db.execute(sql, [id, email, passwordHash, firstName, lastName, driverLicense, phone]);
    }

    // Method to find a user by email (Login - FR1)
    static async findByEmail(email) {
        const sql = 'SELECT * FROM Users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }
}

module.exports = User;