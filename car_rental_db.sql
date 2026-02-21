-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 21, 2026 at 02:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `car_rental_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `adminlogs`
--

CREATE TABLE `adminlogs` (
  `id` varchar(50) NOT NULL,
  `adminId` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ipAddress` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `adminlogs`
--

INSERT INTO `adminlogs` (`id`, `adminId`, `action`, `details`, `ipAddress`, `createdAt`) VALUES
('AL1', 'U1', 'LOGIN', '{\"status\": \"success\"}', '127.0.0.1', '2026-02-20 17:00:39'),
('AL10', 'U1', 'GENERATE_INVOICE', '{\"id\": \"B1\"}', '192.168.1.1', '2026-02-20 17:00:39'),
('AL2', 'U1', 'CREATE_VEHICLE', '{\"id\": \"V1\"}', '127.0.0.1', '2026-02-20 17:00:39'),
('AL3', 'U1', 'UPDATE_PRICE', '{\"id\": \"V2\"}', '127.0.0.1', '2026-02-20 17:00:39'),
('AL4', 'U1', 'DELETE_USER', '{\"id\": \"U99\"}', '127.0.0.1', '2026-02-20 17:00:39'),
('AL5', 'U1', 'VIEW_REPORTS', '{\"month\": \"May\"}', '127.0.0.1', '2026-02-20 17:00:39'),
('AL6', 'U1', 'LOGOUT', '{\"session\": \"closed\"}', '127.0.0.1', '2026-02-20 17:00:39'),
('AL7', 'U1', 'LOGIN', '{\"status\": \"success\"}', '192.168.1.1', '2026-02-20 17:00:39'),
('AL8', 'U1', 'VERIFY_USER', '{\"id\": \"U10\"}', '192.168.1.1', '2026-02-20 17:00:39'),
('AL9', 'U1', 'ADD_MAINTENANCE', '{\"id\": \"V1\"}', '192.168.1.1', '2026-02-20 17:00:39');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `vehicleId` varchar(50) NOT NULL,
  `insurancePlanId` varchar(50) DEFAULT NULL,
  `pickupLocationId` varchar(50) DEFAULT NULL,
  `dropoffLocationId` varchar(50) DEFAULT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `pickupTime` time DEFAULT NULL,
  `dropoffTime` time DEFAULT NULL,
  `totalAmount` decimal(10,2) NOT NULL CHECK (`totalAmount` >= 0),
  `status` enum('pending','confirmed','active','completed','cancelled') DEFAULT 'pending',
  `confirmationNumber` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `bookedAt` datetime DEFAULT current_timestamp(),
  `cancelledAt` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `userId`, `vehicleId`, `insurancePlanId`, `pickupLocationId`, `dropoffLocationId`, `startDate`, `endDate`, `pickupTime`, `dropoffTime`, `totalAmount`, `status`, `confirmationNumber`, `notes`, `bookedAt`, `cancelledAt`) VALUES
('B1', 'U6', 'V1', 'IN3', 'L1', 'L1', '2024-05-01', '2024-05-03', '10:00:00', '10:00:00', 3120.00, 'completed', 'C01', 'Notes', '2026-02-20 17:00:38', NULL),
('B10', 'U10', 'V10', 'IN8', 'L10', 'L10', '2024-09-01', '2024-09-03', '10:00:00', '10:00:00', 870.00, 'confirmed', 'C10', NULL, '2026-02-20 17:00:38', NULL),
('B2', 'U7', 'V2', 'IN2', 'L2', 'L2', '2024-05-05', '2024-05-07', '11:00:00', '11:00:00', 1355.00, 'confirmed', 'C02', NULL, '2026-02-20 17:00:38', NULL),
('B3', 'U8', 'V3', 'IN3', 'L3', 'L3', '2024-06-01', '2024-06-03', '09:00:00', '09:00:00', 2520.00, 'pending', 'C03', NULL, '2026-02-20 17:00:38', NULL),
('B4', 'U9', 'V4', 'IN2', 'L4', 'L4', '2024-06-10', '2024-06-12', '12:00:00', '12:00:00', 2010.00, 'pending', 'C04', NULL, '2026-02-20 17:00:38', NULL),
('B5', 'U10', 'V5', 'IN10', 'L5', 'L5', '2024-07-01', '2024-07-05', '08:00:00', '08:00:00', 8600.00, 'confirmed', 'C05', NULL, '2026-02-20 17:00:38', NULL),
('B6', 'U6', 'V6', 'IN2', 'L6', 'L6', '2024-05-15', '2024-05-17', '10:00:00', '10:00:00', 1710.00, 'completed', 'C06', NULL, '2026-02-20 17:00:38', NULL),
('B7', 'U7', 'V7', 'IN1', 'L7', 'L7', '2024-04-01', '2024-04-02', '14:00:00', '14:00:00', 575.00, 'completed', 'C07', NULL, '2026-02-20 17:00:38', NULL),
('B8', 'U8', 'V8', 'IN3', 'L8', 'L8', '2024-08-01', '2024-08-03', '09:00:00', '09:00:00', 2320.00, 'confirmed', 'C08', NULL, '2026-02-20 17:00:38', NULL),
('B9', 'U9', 'V9', 'IN6', 'L9', 'L9', '2024-05-20', '2024-05-24', '11:00:00', '11:00:00', 3675.00, 'completed', 'C09', NULL, '2026-02-20 17:00:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `insuranceplans`
--

CREATE TABLE `insuranceplans` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `dailyRate` decimal(10,2) NOT NULL CHECK (`dailyRate` >= 0),
  `coverageDetails` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `insuranceplans`
--

INSERT INTO `insuranceplans` (`id`, `name`, `description`, `dailyRate`, `coverageDetails`) VALUES
('IN1', 'Basic', 'Standard coverage', 25.00, 'Basic protection'),
('IN10', 'Total Safe', 'No deductible', 150.00, 'Full peace of mind'),
('IN2', 'Premium', 'Full coverage', 55.00, 'All risks covered'),
('IN3', 'Ultimate', 'Supercar special', 120.00, 'VIP protection'),
('IN4', 'Roadside', 'Tires and glass', 15.00, 'Assistance 24/7'),
('IN5', 'Budget', 'Minimum required', 10.00, 'Liability only'),
('IN6', 'Executive', 'Interior damage', 75.00, 'Luxury care'),
('IN7', 'Theft', 'Anti-theft focus', 20.00, 'Theft protection'),
('IN8', 'EV Care', 'Battery focus', 35.00, 'Electric car care'),
('IN9', 'Young', 'Under 25s', 45.00, 'Higher medical');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `address`, `city`, `country`, `phone`) VALUES
('L1', 'Syracuse Hub', '120 University Ave', 'Syracuse', 'USA', '315-555-0101'),
('L10', 'Atlanta Sky', 'Peachtree 15', 'Atlanta', 'USA', '404-555-1010'),
('L2', 'NYC Elite', '5th Ave 721', 'New York', 'USA', '212-555-0202'),
('L3', 'Miami Beach', 'Ocean Dr 10', 'Miami', 'USA', '305-555-0303'),
('L4', 'LA Sunset', 'Sunset Blvd 90', 'Los Angeles', 'USA', '310-555-0404'),
('L5', 'Chicago Gold', 'Michigan Ave 5', 'Chicago', 'USA', '312-555-0505'),
('L6', 'Vegas Strip', 'Vegas Blvd 35', 'Las Vegas', 'USA', '702-555-0606'),
('L7', 'Houston Row', 'Post Oak 11', 'Houston', 'USA', '713-555-0707'),
('L8', 'SF Tech', 'Market St 100', 'San Francisco', 'USA', '415-555-0808'),
('L9', 'Boston Harbor', 'Atlantic Ave 2', 'Boston', 'USA', '617-555-0909');

-- --------------------------------------------------------

--
-- Table structure for table `maintenancerecords`
--

CREATE TABLE `maintenancerecords` (
  `id` varchar(50) NOT NULL,
  `vehicleId` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `performedAt` datetime NOT NULL,
  `nextServiceDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenancerecords`
--

INSERT INTO `maintenancerecords` (`id`, `vehicleId`, `description`, `cost`, `performedAt`, `nextServiceDate`) VALUES
('M1', 'V1', 'Oil change', 500.00, '2026-02-20 17:00:38', '2024-12-01'),
('M10', 'V10', 'Battery health check', 100.00, '2026-02-20 17:00:38', '2025-05-01'),
('M2', 'V2', 'Tire rotation', 200.00, '2026-02-20 17:00:38', '2024-11-01'),
('M3', 'V3', 'Brake check', 800.00, '2026-02-20 17:00:38', '2025-01-01'),
('M4', 'V4', 'General service', 1000.00, '2026-02-20 17:00:38', '2024-10-01'),
('M5', 'V5', 'Luxury detailing', 300.00, '2026-02-20 17:00:38', '2024-08-01'),
('M6', 'V6', 'Engine tune-up', 1200.00, '2026-02-20 17:00:38', '2025-02-01'),
('M7', 'V7', 'Transmission check', 600.00, '2026-02-20 17:00:38', '2024-09-01'),
('M8', 'V8', 'Exhaust repair', 400.00, '2026-02-20 17:00:38', '2024-12-15'),
('M9', 'V9', 'Software update', 150.00, '2026-02-20 17:00:38', '2024-07-01');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `bookingId` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` >= 0),
  `currency` varchar(10) DEFAULT 'USD',
  `method` enum('credit_card','debit_card','paypal','cash') NOT NULL,
  `transactionId` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `processedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `bookingId`, `amount`, `currency`, `method`, `transactionId`, `status`, `processedAt`) VALUES
('P1', 'B1', 3120.00, 'USD', 'credit_card', 'T01', 'completed', '2026-02-20 17:00:38'),
('P10', 'B8', 2320.00, 'USD', 'debit_card', 'T10', 'completed', '2026-02-20 17:00:38'),
('P2', 'B2', 1355.00, 'USD', 'credit_card', 'T02', 'completed', '2026-02-20 17:00:38'),
('P3', 'B6', 1710.00, 'USD', 'paypal', 'T03', 'completed', '2026-02-20 17:00:38'),
('P4', 'B7', 575.00, 'USD', 'debit_card', 'T04', 'completed', '2026-02-20 17:00:38'),
('P5', 'B9', 3675.00, 'USD', 'credit_card', 'T05', 'completed', '2026-02-20 17:00:38'),
('P6', 'B5', 8600.00, 'USD', 'credit_card', 'T06', 'pending', '2026-02-20 17:00:38'),
('P7', 'B10', 870.00, 'USD', 'paypal', 'T07', 'pending', '2026-02-20 17:00:38'),
('P8', 'B3', 2520.00, 'USD', 'cash', 'T08', 'pending', '2026-02-20 17:00:38'),
('P9', 'B4', 2010.00, 'USD', 'credit_card', 'T09', 'failed', '2026-02-20 17:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `vehicleId` varchar(50) NOT NULL,
  `bookingId` varchar(50) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `userId`, `vehicleId`, `bookingId`, `rating`, `comment`, `createdAt`) VALUES
('R1', 'U6', 'V1', 'B1', 5, 'Amazing car!', '2026-02-20 17:00:38'),
('R10', 'U10', 'V5', 'B5', 5, 'Best trip ever', '2026-02-20 17:00:38'),
('R2', 'U7', 'V2', 'B2', 5, 'Great Porsche experience', '2026-02-20 17:00:38'),
('R3', 'U6', 'V6', 'B6', 4, 'Beautiful Aston Martin', '2026-02-20 17:00:38'),
('R4', 'U7', 'V7', 'B7', 5, 'Fast and reliable', '2026-02-20 17:00:38'),
('R5', 'U9', 'V9', 'B9', 5, 'Luxury at its best', '2026-02-20 17:00:38'),
('R6', 'U10', 'V10', 'B10', 4, 'Love the electric power', '2026-02-20 17:00:38'),
('R7', 'U8', 'V8', 'B8', 5, 'Mercedes AMG is a beast', '2026-02-20 17:00:38'),
('R8', 'U6', 'V1', 'B1', 5, 'Second time renting, still perfect', '2026-02-20 17:00:38'),
('R9', 'U7', 'V3', 'B3', 3, 'Service was slow', '2026-02-20 17:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `driverLicense` varchar(50) DEFAULT NULL,
  `licenseExpiration` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT 0,
  `isAdmin` tinyint(1) DEFAULT 0,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `passwordHash`, `firstName`, `lastName`, `driverLicense`, `licenseExpiration`, `phone`, `dateOfBirth`, `isVerified`, `isAdmin`, `createdAt`) VALUES
('U1', 'hesto@syr.edu', 'hash1', 'Hesto', 'Admin', 'DL01', '2028-01-01', '315-001', '1995-01-01', 1, 1, '2026-02-20 17:00:38'),
('U10', 'customer5@mail.com', 'hash10', 'Bruce', 'Wayne', 'DL10', '2030-01-01', '315-010', '1985-01-01', 1, 0, '2026-02-20 17:00:38'),
('U2', 'ryan@syr.edu', 'hash2', 'Ryan', 'DB', 'DL02', '2027-01-01', '315-002', '1996-01-01', 1, 0, '2026-02-20 17:00:38'),
('U3', 'zichen@syr.edu', 'hash3', 'Zichen', 'Dev', 'DL03', '2027-05-01', '315-003', '1997-01-01', 1, 0, '2026-02-20 17:00:38'),
('U4', 'chang@syr.edu', 'hash4', 'Chang', 'Dev', 'DL04', '2026-01-01', '315-004', '1998-01-01', 1, 0, '2026-02-20 17:00:38'),
('U5', 'hussein@syr.edu', 'hash5', 'Hussein', 'UI', 'DL05', '2029-01-01', '315-005', '1999-01-01', 1, 0, '2026-02-20 17:00:38'),
('U6', 'customer1@mail.com', 'hash6', 'John', 'Doe', 'DL06', '2025-12-01', '315-006', '1990-01-01', 1, 0, '2026-02-20 17:00:38'),
('U7', 'customer2@mail.com', 'hash7', 'Jane', 'Smith', 'DL07', '2027-11-01', '315-007', '1992-01-01', 1, 0, '2026-02-20 17:00:38'),
('U8', 'customer3@mail.com', 'hash8', 'Mike', 'Ross', 'DL08', '2026-08-01', '315-008', '1993-01-01', 1, 0, '2026-02-20 17:00:38'),
('U9', 'customer4@mail.com', 'hash9', 'Emma', 'Stone', 'DL09', '2028-03-01', '315-009', '1991-01-01', 1, 0, '2026-02-20 17:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `vehicleimages`
--

CREATE TABLE `vehicleimages` (
  `id` varchar(50) NOT NULL,
  `vehicleId` varchar(50) NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `isPrimary` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicleimages`
--

INSERT INTO `vehicleimages` (`id`, `vehicleId`, `imageUrl`, `isPrimary`) VALUES
('I1', 'V1', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format', 1),
('I10', 'V10', 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1),
('I2', 'V2', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format', 1),
('I3', 'V3', 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=1200&auto=format', 1),
('I4', 'V4', 'https://images.unsplash.com/photo-1652449661780-f25fc1cce90a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1),
('I5', 'V5', 'https://images.unsplash.com/photo-1599912027611-484b9fc447af?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1),
('I6', 'V6', 'https://images.unsplash.com/photo-1710210123743-53fc30119e73?q=80&w=692&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1),
('I7', 'V7', 'https://images.unsplash.com/photo-1555652736-e92021d28a10?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1),
('I8', 'V8', 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1),
('I9', 'V9', 'https://images.unsplash.com/photo-1742226111149-723e841fc23b?q=80&w=682&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` varchar(50) NOT NULL,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `category` enum('sedan','SUV','economy','luxury') NOT NULL,
  `transmission` enum('automatic','manual') NOT NULL,
  `fuelType` enum('gasoline','diesel','electric','hybrid') NOT NULL,
  `seats` int(11) NOT NULL,
  `color` varchar(30) DEFAULT NULL,
  `plateNumber` varchar(20) NOT NULL,
  `mileage` int(11) DEFAULT 0,
  `dailyRate` decimal(10,2) NOT NULL CHECK (`dailyRate` > 0),
  `status` enum('available','reserved','rented','maintenance','inactive') DEFAULT 'available',
  `locationId` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `make`, `model`, `year`, `category`, `transmission`, `fuelType`, `seats`, `color`, `plateNumber`, `mileage`, `dailyRate`, `status`, `locationId`, `createdAt`) VALUES
('V1', 'Lamborghini', 'Aventador', 2023, 'luxury', 'automatic', 'gasoline', 2, 'Yellow', 'RENT-01', 0, 1500.00, 'available', 'L1', '2026-02-20 17:00:38'),
('V10', 'Tesla', 'Model S', 2024, 'luxury', 'automatic', 'electric', 5, 'Black', 'RENT-10', 0, 400.00, 'available', 'L10', '2026-02-20 17:00:38'),
('V2', 'Porsche', '911 Turbo', 2024, 'luxury', 'automatic', 'gasoline', 4, 'Silver', 'RENT-02', 0, 650.00, 'available', 'L2', '2026-02-20 17:00:38'),
('V3', 'Ferrari', '812', 2023, 'luxury', 'automatic', 'gasoline', 2, 'Red', 'RENT-03', 0, 1200.00, 'available', 'L3', '2026-02-20 17:00:38'),
('V4', 'McLaren', '720S', 2023, 'luxury', 'automatic', 'gasoline', 2, 'Orange', 'RENT-04', 0, 950.00, 'available', 'L4', '2026-02-20 17:00:38'),
('V5', 'Rolls-Royce', 'Ghost', 2024, 'luxury', 'automatic', 'gasoline', 5, 'White', 'RENT-05', 0, 2000.00, 'available', 'L5', '2026-02-20 17:00:38'),
('V6', 'Aston Martin', 'DBS', 2023, 'luxury', 'automatic', 'gasoline', 4, 'Green', 'RENT-06', 0, 800.00, 'available', 'L6', '2026-02-20 17:00:38'),
('V7', 'Audi', 'R8', 2023, 'luxury', 'automatic', 'gasoline', 2, 'Black', 'RENT-07', 0, 550.00, 'available', 'L7', '2026-02-20 17:00:38'),
('V8', 'Mercedes', 'AMG GT', 2022, 'luxury', 'automatic', 'gasoline', 2, 'Grey', 'RENT-08', 0, 1100.00, 'available', 'L8', '2026-02-20 17:00:38'),
('V9', 'Bentley', 'GT', 2024, 'luxury', 'automatic', 'gasoline', 4, 'Blue', 'RENT-09', 0, 900.00, 'available', 'L9', '2026-02-20 17:00:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `adminlogs`
--
ALTER TABLE `adminlogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `adminId` (`adminId`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `confirmationNumber` (`confirmationNumber`),
  ADD KEY `insurancePlanId` (`insurancePlanId`),
  ADD KEY `pickupLocationId` (`pickupLocationId`),
  ADD KEY `dropoffLocationId` (`dropoffLocationId`),
  ADD KEY `idx_booking_user` (`userId`),
  ADD KEY `idx_booking_vehicle` (`vehicleId`),
  ADD KEY `idx_booking_status` (`status`);

--
-- Indexes for table `insuranceplans`
--
ALTER TABLE `insuranceplans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicleId` (`vehicleId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactionId` (`transactionId`),
  ADD KEY `idx_payment_booking` (`bookingId`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `bookingId` (`bookingId`),
  ADD KEY `idx_review_vehicle` (`vehicleId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `driverLicense` (`driverLicense`);

--
-- Indexes for table `vehicleimages`
--
ALTER TABLE `vehicleimages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicleId` (`vehicleId`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plateNumber` (`plateNumber`),
  ADD KEY `idx_vehicle_status` (`status`),
  ADD KEY `idx_vehicle_location` (`locationId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `adminlogs`
--
ALTER TABLE `adminlogs`
  ADD CONSTRAINT `adminlogs_ibfk_1` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`);

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`insurancePlanId`) REFERENCES `insuranceplans` (`id`),
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`pickupLocationId`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`dropoffLocationId`) REFERENCES `locations` (`id`);

--
-- Constraints for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  ADD CONSTRAINT `maintenancerecords_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`);

--
-- Constraints for table `vehicleimages`
--
ALTER TABLE `vehicleimages`
  ADD CONSTRAINT `vehicleimages_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
