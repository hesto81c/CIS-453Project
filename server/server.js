const express = require('express');
const cors = require('cors');
const carRoutes = require('./routes/carRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Use of vehicle routes
app.use('/api/cars', carRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});