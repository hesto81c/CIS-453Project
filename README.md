README_RENTAL10
Rental10 - Luxury Car Rental System

This is a Full-Stack web application prototype designed for a high-end vehicle rental service. It features a dynamic React frontend, a Node.js/Express API, and a MySQL relational database.

Technology Stack

  - Frontend: React.js (Component-based UI)
  - Backend: Node.js & Express (RESTful API)
  - Database: MySQL (Structured Data Management)
  - Security: Environment Variables (Dotenv)

Setup & Installation

1. Database Configuration

1.  Open your XAMPP Control Panel and start Apache and MySQL.
2.  Navigate to http://localhost/phpmyadmin.
3.  Create a new database named car_rental_db.
4.  Import the SQL script located in: /database/export.sql.

2. Backend Setup

1.  Open a terminal in the /server folder.
2.  Install dependencies: npm install
3.  Create a .env file in the /server directory and paste your credentials:
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=car_rental_db
    PORT=5000
    JWT_SECRET=SyracuseRental10_2026_SecureKey
4.  Start the server: npm start

3. Frontend Setup

1.  Open a separate terminal in the /client folder.
2.  Install dependencies: npm install
3.  Start the React application: npm start
4.  The application will open automatically at http://localhost:3000.

Repository Structure

  - /client: Frontend source code and assets.
  - /server: Backend logic, API routes, and DB connection.
  - /database: SQL export files for database replication.

Testing Criteria

  - Verify the console shows "Connected to MySQL Database".
  - Verify the Catalog section fetches and renders 10 vehicle slides.
  - Verify responsiveness by resizing the browser window.