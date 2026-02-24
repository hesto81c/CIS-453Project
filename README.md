# CIS 453 Car Rental Project

This repository contains a full-stack car rental web application.

## Tech Stack
- Frontend: React
- Backend: Node.js / Express
- Database: MySQL
- Local Dev/Deployment: Docker Compose

## Project Structure
- `client/` - React frontend
- `server/` - Express backend API
- `car_rental_db.sql` - MySQL schema + seed data (auto-imported by Docker on first run)

## Run with Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Start
From the project root:

```bash
docker compose up --build


URLs

Frontend: http://localhost:3000

Backend API: http://localhost:5000

Reset database (re-run SQL init)
docker compose down -v
docker compose up --build