TROUBLESHOOTING Guide - RENTAL 10
If you encounter issues while running the prototype, please check the following common solutions:

1. Database Connection Issues (ECONNREFUSED)
Problem: The server fails to connect to MySQL.

Solution:

Ensure MySQL is active (Green) in the XAMPP Control Panel.

Check that your .env variables match your phpMyAdmin credentials (User, Password, Port).

Ensure you have created the database car_rental_db (or the name specified in your .env) before starting the server.

2. Missing Module Error (uuid)
Problem: The backend crashes with the error: "Cannot find module 'uuid'".

Solution:

The new booking system requires the uuid library to generate unique IDs.

Open your terminal in the /server folder and run: npm install uuid.

Restart the server with node server.js.

3. API Data Not Loading (Empty Catalog or White Screen)
Problem: The React frontend is visible, but the cars or vehicle details are not appearing.

Solution:

Backend Check: Ensure the backend server is running on port 5000.

CORS Policy: Check the browser console (F12) for CORS errors. Ensure app.use(cors()) is active in server.js.

Route Check: Ensure your App.js has the correct path: <Route path="/details/:id" element={<CarDetails />} />.

Database Content: Verify that the tables Vehicles, VehicleImages, and Locations actually contain data.

4. Dependency Errors (Missing Modules)
Problem: npm start or node server.js fails with "module not found".

Solution:

Run npm install in both the /client and /server folders.

Common missing packages: axios, react-router-dom (client) and express, cors, mysql2, dotenv, uuid (server).

5. Port Conflict (Port 5000 already in use)
Problem: The backend server crashes on startup because the port is taken.

Solution:

Close any other terminal running the server.

If the problem persists, change PORT=5000 to PORT=5001 in your .env file.

Note: If you change the port, you must also update the API URL in CarDetails.js and Booking.js.

6. Booking Calendar Issues
Problem: Dates are not being blocked or the reservation fails.

Solution:

Ensure the Bookings table exists in your database.

Check the browser console (F12) to see if the POST request to /api/bookings/create is returning an error.

Make sure the startDate and endDate being sent are in YYYY-MM-DD format.