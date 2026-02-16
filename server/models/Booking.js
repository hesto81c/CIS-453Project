const db = require('../config/db');

class Booking {
    // Crear una nueva reserva (FR3)
    static async create(bookingData) {
        const { id, userId, vehicleId, startDate, endDate, totalCost } = bookingData;
        const sql = `
            INSERT INTO Bookings (id, userId, vehicleId, startDate, endDate, totalCost, status)
            VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
        `;
        return db.execute(sql, [id, userId, vehicleId, startDate, endDate, totalCost]);
    }

    // Obtener reservas de un usuario específico (FR3 - View Bookings)
    static async getByUserId(userId) {
        const sql = `
            SELECT b.*, v.make, v.model 
            FROM Bookings b
            JOIN Vehicles v ON b.vehicleId = v.id
            WHERE b.userId = ?
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    // Cancelar una reserva (Lógica para el Admin - FR5)
    static async cancel(bookingId) {
        const sql = "UPDATE Bookings SET status = 'cancelled' WHERE id = ?";
        return db.execute(sql, [bookingId]);
    }
}

module.exports = Booking;