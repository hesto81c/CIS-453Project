import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- Vehicle Services (FR2 and FR3) ---
// Make sure the backend uses the /api/cars route
export const getVehicles = () => api.get('/cars'); 
export const getVehiclesByCategory = (category) => api.get(`/cars/category/${category}`);
export const checkVehicleStatus = (id) => api.get(`/cars/status/${id}`);

// --- Reservation Services (FR3) ---
// IMPORTANT CHANGE: We use .post to send data to the server
export const createBooking = (bookingData) => api.post('/bookings', bookingData); 
export const getUserHistory = (userId) => api.get(`/bookings/user/${userId}`);

export default api;