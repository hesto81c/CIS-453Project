-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 02:50 AM
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
('4e986380-0192-432a-a55b-470eef2dbe3c', '1771875852225', 'V8', NULL, 'L10', 'L10', '2026-03-01', '2026-03-18', '10:00:00', '10:00:00', 20729.61, 'cancelled', 'RNT-1772317332982-9563', NULL, '2026-02-28 17:22:12', NULL),
('960a3e84-9cdb-4a7d-a25e-7c6aadf723e4', '1771813226505', 'V1', NULL, 'L10', 'L10', '2026-03-01', '2026-03-06', '10:00:00', '10:00:00', 8165.63, 'cancelled', 'RNT-1771814796832-8028', NULL, '2026-02-22 21:46:36', NULL),
('B1', 'U6', 'V1', 'IN3', 'L1', 'L1', '2024-05-01', '2024-05-03', '10:00:00', '10:00:00', 3120.00, 'completed', 'C01', 'Notes', '2026-02-20 17:00:38', NULL),
('B10', 'U10', 'V10', 'IN8', 'L10', 'L10', '2024-09-01', '2024-09-03', '10:00:00', '10:00:00', 870.00, 'confirmed', 'C10', NULL, '2026-02-20 17:00:38', NULL),
('B2', 'U7', 'V2', 'IN2', 'L2', 'L2', '2024-05-05', '2024-05-07', '11:00:00', '11:00:00', 1355.00, 'confirmed', 'C02', NULL, '2026-02-20 17:00:38', NULL),
('B3', 'U8', 'V3', 'IN3', 'L3', 'L3', '2024-06-01', '2024-06-03', '09:00:00', '09:00:00', 2520.00, 'cancelled', 'C03', NULL, '2026-02-20 17:00:38', NULL),
('B4', 'U9', 'V4', 'IN2', 'L4', 'L4', '2024-06-10', '2024-06-12', '12:00:00', '12:00:00', 2010.00, 'cancelled', 'C04', NULL, '2026-02-20 17:00:38', NULL),
('B5', 'U10', 'V5', 'IN10', 'L5', 'L5', '2024-07-01', '2024-07-05', '08:00:00', '08:00:00', 8600.00, 'confirmed', 'C05', NULL, '2026-02-20 17:00:38', NULL),
('B6', 'U6', 'V6', 'IN2', 'L6', 'L6', '2024-05-15', '2024-05-17', '10:00:00', '10:00:00', 1710.00, 'completed', 'C06', NULL, '2026-02-20 17:00:38', NULL),
('B7', 'U7', 'V7', 'IN1', 'L7', 'L7', '2024-04-01', '2024-04-02', '14:00:00', '14:00:00', 575.00, 'completed', 'C07', NULL, '2026-02-20 17:00:38', NULL),
('B8', 'U8', 'V8', 'IN3', 'L8', 'L8', '2024-08-01', '2024-08-03', '09:00:00', '09:00:00', 2320.00, 'confirmed', 'C08', NULL, '2026-02-20 17:00:38', NULL),
('B9', 'U9', 'V9', 'IN6', 'L9', 'L9', '2024-05-20', '2024-05-24', '11:00:00', '11:00:00', 3675.00, 'completed', 'C09', NULL, '2026-02-20 17:00:38', NULL),
('bf18f2b9-3e9e-4930-a07a-8a1265446f12', '1771813226505', 'V1', NULL, 'L10', 'L10', '2026-02-23', '2026-02-28', '10:00:00', '10:00:00', 8274.45, 'cancelled', 'RNT-1771813293052-7379', NULL, '2026-02-22 21:21:33', NULL),
('d49b747f-351e-4e9d-b5b3-988c85f200f2', '1771875852225', 'V1', NULL, 'L10', 'L10', '2026-03-13', '2026-03-18', '10:00:00', '10:00:00', 8274.45, 'cancelled', 'RNT-1772317301124-1321', NULL, '2026-02-28 17:21:41', NULL),
('e4b9c1c7-9f0a-47cc-a8cf-19d0b75d239b', '1771875852225', 'V1', NULL, 'L10', 'L10', '2026-03-01', '2026-03-08', '10:00:00', '10:00:00', 11584.22, 'cancelled', 'RNT-1772318444771-2977', NULL, '2026-02-28 17:40:44', NULL),
('e4fb8c99-8fce-46e1-8ccf-f7c123a58eb8', '1771875852225', 'V1', NULL, 'L10', 'L10', '2026-03-09', '2026-03-12', '10:00:00', '10:00:00', 4964.67, 'cancelled', 'RNT-1772233635759-5247', NULL, '2026-02-27 18:07:15', NULL),
('f3ce95c5-c219-4e0a-b462-d749899ebf32', '1771875852225', 'V8', NULL, 'L10', 'L10', '2026-03-19', '2026-03-31', '10:00:00', '10:00:00', 14632.67, 'cancelled', 'RNT-1772318243612-2130', NULL, '2026-02-28 17:37:23', NULL);

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
('353a1b6f-e21b-4bf7-ab28-6805435fb2f7', 'e4b9c1c7-9f0a-47cc-a8cf-19d0b75d239b', 11584.22, 'USD', 'credit_card', 'TXN-1772318467181-8706', '', '2026-02-28 17:41:07'),
('3be78710-e043-4766-86c5-b9a75919df6e', 'e4fb8c99-8fce-46e1-8ccf-f7c123a58eb8', 4964.67, 'USD', 'credit_card', 'TXN-1772233798940-6579', '', '2026-02-27 18:09:58'),
('7f19421e-a41e-4903-bd09-7b3ac9c9df00', '960a3e84-9cdb-4a7d-a25e-7c6aadf723e4', 8165.63, 'USD', 'paypal', NULL, 'pending', '2026-02-22 21:46:36'),
('94f8c552-fb75-4050-abd9-81de8da133ec', 'f3ce95c5-c219-4e0a-b462-d749899ebf32', 14632.67, 'USD', 'credit_card', NULL, '', '2026-02-28 17:37:23'),
('aca310e1-965b-4946-861c-08d2df74e7c8', 'bf18f2b9-3e9e-4930-a07a-8a1265446f12', 8274.45, 'USD', 'credit_card', NULL, 'pending', '2026-02-22 21:21:33'),
('b9764128-4fe4-4915-99ae-a013687abb00', '4e986380-0192-432a-a55b-470eef2dbe3c', 20729.61, 'USD', 'credit_card', NULL, '', '2026-02-28 17:22:12'),
('e345b54d-0314-4b7d-a40c-eddb8fa2bf87', 'd49b747f-351e-4e9d-b5b3-988c85f200f2', 8274.45, 'USD', 'credit_card', NULL, '', '2026-02-28 17:21:41'),
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
  `createdAt` datetime DEFAULT current_timestamp(),
  `profilePhoto` longtext DEFAULT NULL,
  `resetToken` varchar(64) DEFAULT NULL,
  `resetTokenExpiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `passwordHash`, `firstName`, `lastName`, `driverLicense`, `licenseExpiration`, `phone`, `dateOfBirth`, `isVerified`, `isAdmin`, `createdAt`, `profilePhoto`, `resetToken`, `resetTokenExpiry`) VALUES
('1771813226505', 'joeds@gmail.com', '$2b$10$fJzxpSVwYX1bNqtWI82UH.q3EfkDOfuyG51JBD7sl5WnsLt6RKdv6', 'Johnee', 'Does', 'DL-1771813226324', NULL, '3123123123', NULL, 0, 0, '2026-02-22 21:20:26', NULL, NULL, NULL),
('1771875852225', 'hueot@gmail.com', '$2b$10$SCZnzVNKvFU8ISPUgLEhd.wVGs2Cfd3th33565w.Ka0fdB5S8tVZK', 'Hu', 'Eote', 'DL56565656', NULL, '3153153153', NULL, 0, 0, '2026-02-23 14:44:12', 'data:image/jpeg;base64,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', NULL, NULL),
('U1', 'hestevan@syr.edu', 'hash1', 'Hussein', 'Admin', 'DL01', '2028-01-01', '315-001', '1995-01-01', 1, 1, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U10', 'customer5@mail.com', 'hash10', 'Bruce', 'Wayne', 'DL10', '2030-01-01', '315-010', '1985-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U2', 'ryan@syr.edu', 'hash2', 'Ryan', 'DB', 'DL02', '2027-01-01', '315-002', '1996-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U3', 'zichen@syr.edu', 'hash3', 'Zichen', 'Dev', 'DL03', '2027-05-01', '315-003', '1997-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U4', 'chang@syr.edu', 'hash4', 'Chang', 'Dev', 'DL04', '2026-01-01', '315-004', '1998-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U5', 'hofftman@syr.edu', 'hash5', 'Hofftman', 'UI', 'DL05', '2029-01-01', '315-005', '1999-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U6', 'customer1@mail.com', 'hash6', 'John', 'Doe', 'DL06', '2025-12-01', '315-006', '1990-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U7', 'customer2@mail.com', 'hash7', 'Jane', 'Smith', 'DL07', '2027-11-01', '315-007', '1992-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U8', 'customer3@mail.com', 'hash8', 'Mike', 'Ross', 'DL08', '2026-08-01', '315-008', '1993-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL),
('U9', 'customer4@mail.com', 'hash9', 'Emma', 'Stone', 'DL09', '2028-03-01', '315-009', '1991-01-01', 1, 0, '2026-02-20 17:00:38', NULL, NULL, NULL);

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
('I1', 'V1', 'https://images.unsplash.com/photo-1597423012010-f7554c74bad0?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1),
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
