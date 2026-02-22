const db = require('../config/db');

const User = {
    // Check if email exists
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    },

    // Create new user in your specific table
    create: (userData) => {
        return new Promise((resolve, reject) => {
            const { id, email, passwordHash, firstName, lastName, driverLicense, phone } = userData;
            const query = `INSERT INTO Users (id, email, passwordHash, firstName, lastName, driverLicense, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.query(query, [id, email, passwordHash, firstName, lastName, driverLicense, phone], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }
};

module.exports = User;