const express = require('express');
const cors = require('cors'); // Required to allow React to talk to this server
const carRoutes = require('./routes/carRoutes');
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); // Enables Cross-Origin Resource Sharing (Fixes the "Black Screen" issue)
app.use(express.json()); // Allows the server to parse JSON data

// --- ROUTES ---
// Mount the car routes at /api/cars
app.use('/api/cars', carRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚗 Fleet API available at http://localhost:${PORT}/api/cars`);
});