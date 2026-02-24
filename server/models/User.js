const db = require('../config/db'); // promise-based pool

const User = {
    // Check if email exists
    findByEmail: async (email) => {
        const [results] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        return results[0];
    },

    // Create new user
    create: async (userData) => {
        const { id, email, passwordHash, firstName, lastName, driverLicense, phone } = userData;
        const [results] = await db.query(
            `INSERT INTO Users (id, email, passwordHash, firstName, lastName, driverLicense, phone)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, email, passwordHash, firstName, lastName, driverLicense || null, phone || null]
        );
        return results;
    }
};

module.exports = User;