require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const carRoutes     = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes    = require('./routes/authRoutes'); // ← AGREGAR

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cars',     carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth',     authRoutes); // ← AGREGAR

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🚗 Fleet API:     http://localhost:${PORT}/api/cars`);
  console.log(`📅 Bookings API:  http://localhost:${PORT}/api/bookings`);
  console.log(`💳 Payments API:  http://localhost:${PORT}/api/payments`);
  console.log(`🔐 Auth API:      http://localhost:${PORT}/api/auth`);
  console.log(`🔑 JWT Secret loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
});