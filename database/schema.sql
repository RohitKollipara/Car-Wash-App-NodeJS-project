-- ============================================
-- CAR WASH SERVICE APP - Database Schema
-- Run this file in MySQL Workbench or phpMyAdmin
-- ============================================

-- Step 1: Create and select the database
CREATE DATABASE IF NOT EXISTS carwash_db;
USE carwash_db;

-- Step 2: Create services table
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INT NOT NULL -- duration in minutes
);

-- Step 3: Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  car_model VARCHAR(100) NOT NULL,
  service_id INT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Step 4: Insert sample services
INSERT INTO services (name, price, duration) VALUES
('Basic Wash', 199.00, 30),
('Premium Wash', 399.00, 45),
('Full Detailing', 799.00, 90),
('Interior Cleaning', 499.00, 60),
('Wax & Polish', 599.00, 75);

-- Step 5: Insert sample bookings (for testing)
INSERT INTO bookings (customer_name, phone, car_model, service_id, booking_date, booking_time, status) VALUES
('Rahul Sharma', '9876543210', 'Maruti Swift', 1, '2026-04-20', '10:00:00', 'confirmed'),
('Priya Mehta', '9123456780', 'Honda City', 3, '2026-04-21', '11:30:00', 'pending'),
('Amit Patel', '9988776655', 'Hyundai Creta', 2, '2026-04-22', '09:00:00', 'completed');
