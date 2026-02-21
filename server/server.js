require('dotenv').config(); // 1. SIEMPRE en la primera línea para que las rutas vean las variables
const express = require('express');
const cors = require('cors'); 
const carRoutes = require('./routes/carRoutes');

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); 

// --- ROUTES ---
// Mount the car routes at /api/cars
app.use('/api/cars', carRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚗 Fleet API available at http://localhost:${PORT}/api/cars`);
    console.log(`🔑 JWT Secret loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`); // Verificación rápida
});