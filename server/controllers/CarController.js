const Vehicle = require('../models/Vehicle');

// Get all vehicles for the catalog (FR2)
exports.getCars = async (req, res) => {
    try {
        const cars = await Vehicle.getAll();
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving vehicles", error: error.message });
    }
};

// Get vehicles filtered by category (FR2 - sedan, SUV, economy)
exports.getCarsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const cars = await Vehicle.getByCategory(category);
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ message: "Error filtering vehicles", error: error.message });
    }
};

// Check if a specific car is available (FR3)
exports.checkCarStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const isAvailable = await Vehicle.checkAvailability(id);
        if (isAvailable) {
            res.status(200).json({ available: true });
        } else {
            res.status(200).json({ available: false, message: "Vehicle is currently rented" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error checking status", error: error.message });
    }
};