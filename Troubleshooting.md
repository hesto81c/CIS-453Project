TROUBLESHOOTING_RENTAL10
Troubleshooting Guide - Rental10

If you encounter issues while running the prototype, please check the following common solutions:

1.  Database Connection Issues (ECONNREFUSED)

  - Problem: The server fails to connect to MySQL.
  - Solution:
      - Ensure MySQL is active (Green) in the XAMPP Control Panel.
      - Check that your .env variables match your phpMyAdmin settings.
      - Ensure you have created the database car_rental_db before running the server.

2.  API Data Not Loading (Empty Catalog)

  - Problem: The React frontend is visible, but the cars are not appearing.
  - Solution:
      - Ensure the backend server is running on port 5000.
      - Check the browser console (F12) for CORS errors. If found, ensure app.use(cors()) is active in server.js.
      - Verify that the table Vehicles actually contains data.

3.  Dependency Errors (Missing Modules)

  - Problem: Command npm start fails with "module not found".
  - Solution:
      - Run npm install in both the /client and /server folders again.
      - Ensure you are running the command in the correct directory.

4.  Port Conflict (Port 5000 already in use)

  - Problem: The backend server crashes on startup.
  - Solution:
      - Open your .env file and change PORT=5000 to PORT=5001.
      - Note: If you change the backend port, you must update the API URL in the React frontend code.

5.  Environment Variable Issues

  - Problem: The database password or host is being read as undefined.
  - Solution:
      - Ensure your .env file is located in the root of the /server directory.
      - Restart the server after every change to the .env file.