import axios from 'axios';

// The base URL points to your Node.js server (Week 3 Setup)
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- Vehicle Services (FR2 and FR3) ---
export const getVehicles = () => api.get('/cars');
export const getVehiclesByCategory = (category) => api.get(`/cars/category/${category}`);
export const checkVehicleStatus = (id) => api.get(`/cars/status/${id}`);

// --- Servicios de Reservas (FR3) ---
export const createBooking = (bookingData) => api.get('/bookings', bookingData);
export const getUserHistory = (userId) => api.get(`/bookings/user/${userId}`);

export default api;