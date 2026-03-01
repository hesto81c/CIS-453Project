RENTAL 10 - README.md
Rental 10 is a professional Full-Stack web application designed for a high-end luxury vehicle rental service. This prototype features a dynamic React frontend, a secure Node.js/Express REST API, and a MySQL relational database.

Technology Stack
Frontend: React.js (Component-based UI with React Router)

Backend: Node.js & Express (RESTful API)

Database: MySQL (Relational Data Management)

Security: Dotenv (Environment Variables) & UUID (Unique Transaction Identifiers)

Repository Structure
/client: React source code, components (CarDetails, Booking), and assets.

/server: Express server logic, database connection (db.js), and API routes.

/database: SQL export files for schema and initial data replication.

Setup & Installation
1. Database Configuration
Open your XAMPP Control Panel and start Apache and MySQL.

Navigate to http://localhost/phpmyadmin.

Create a new database named car_rental_db.

Import the SQL script located in: /database/export.sql.

2. Backend Setup (Server)
Open a terminal in the /server folder.

Install dependencies:

Bash
npm install express mysql2 cors dotenv uuid
(The uuid library is required for generating unique booking and payment IDs).

Create a .env file in the /server directory and paste your credentials:

Fragmento de código
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=car_rental_db
PORT=5000
JWT_SECRET=SyracuseRental10_2026_SecureKey
Start the server:

Bash
node server.js
3. Frontend Setup (Client)
Open a separate terminal in the /client folder.

Install dependencies:

Bash
npm install axios react-router-dom
Start the React application:

Bash
npm start
The application will open automatically at http://localhost:3000.

Testing & Verification Criteria
Connectivity: Confirm the backend console logs: Server running on port 5000 and Connected to MySQL Database.

Data Rendering: Ensure the Catalog fetches and displays vehicle cards.

Dynamic Routing: Click "Details" to verify that CarDetails.js fetches specific data based on the URL ID.

Booking Flow: Use the Booking calendar to select dates and verify that the system calculates the price and generates a unique confirmation number.

Responsiveness: Verify the UI layout adapts smoothly to mobile, tablet, and desktop screens.