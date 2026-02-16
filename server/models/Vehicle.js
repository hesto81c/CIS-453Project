const db = require('../config/db');

class Vehicle {
    // Fetch all vehicles (FR2 - Browsing)
    static async getAll() {
        const sql = 'SELECT * FROM Vehicles';
        const [rows] = await db.execute(sql);
        return rows;
    }

    // Filter by category (FR2 - sedan, SUV, economy)
    static async getByCategory(category) {
        const sql = 'SELECT * FROM Vehicles WHERE category = ?';
        const [rows] = await db.execute(sql, [category]);
        return rows;
    }

    // Check availability for a specific vehicle (FR3 - Booking)
    static async checkAvailability(id) {
        const sql = "SELECT status FROM Vehicles WHERE id = ? AND status = 'available'";
        const [rows] = await db.execute(sql, [id]);
        return rows.length > 0;
    }

    // Update status (e.g., set to 'rented' after booking)
    static async updateStatus(id, status) {
        const sql = 'UPDATE Vehicles SET status = ? WHERE id = ?';
        return db.execute(sql, [status, id]);
    }
}

module.exports = Vehicle;