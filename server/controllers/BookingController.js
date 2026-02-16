const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.createBooking = async (req, res) => {
    const { userId, vehicleId, startDate, endDate, dailyRate } = req.body;

    try {
        // 1. Verificar disponibilidad nuevamente por seguridad (FR3)
        const isAvailable = await Vehicle.checkAvailability(vehicleId);
        if (!isAvailable) {
            return res.status(400).json({ message: "Vehicle is no longer available" });
        }

        // 2. Calcular el costo total (Diferencia de días * tarifa diaria)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const totalCost = diffDays * dailyRate;

        // 3. Crear la reserva en la base de datos (FR3)
        const bookingId = Date.now(); // Generador de ID temporal
        await Booking.create({
            id: bookingId,
            userId,
            vehicleId,
            startDate,
            endDate,
            totalCost
        });

        // 4. Actualizar el estado del vehículo a 'rented' (FR5)
        await Vehicle.updateStatus(vehicleId, 'rented');

        res.status(201).json({ 
            message: "Booking confirmed successfully", 
            bookingId,
            totalCost 
        });

    } catch (error) {
        res.status(500).json({ message: "Error processing booking", error: error.message });
    }
};

exports.getUserHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        const history = await Booking.getByUserId(userId);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving history", error: error.message });
    }
};