// routes/bookings.js - Full CRUD for bookings
const express = require('express');
const router = express.Router();
const db = require('../db');

// ─── CREATE - POST /api/bookings ───────────────────────────────
router.post('/', (req, res) => {
  const { customer_name, phone, car_model, service_id, booking_date, booking_time } = req.body;

  // Basic validation
  if (!customer_name || !phone || !car_model || !service_id || !booking_date || !booking_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `
    INSERT INTO bookings (customer_name, phone, car_model, service_id, booking_date, booking_time, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;
  const values = [customer_name, phone, car_model, service_id, booking_date, booking_time];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Booking created successfully!', bookingId: result.insertId });
  });
});

// ─── READ ALL - GET /api/bookings ──────────────────────────────
router.get('/', (req, res) => {
  const sql = `
    SELECT b.*, s.name AS service_name, s.price
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ─── READ ONE - GET /api/bookings/:id ──────────────────────────
router.get('/:id', (req, res) => {
  const sql = `
    SELECT b.*, s.name AS service_name, s.price
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(results[0]);
  });
});

// ─── UPDATE - PUT /api/bookings/:id ────────────────────────────
router.put('/:id', (req, res) => {
  const { customer_name, phone, car_model, service_id, booking_date, booking_time, status } = req.body;

  const sql = `
    UPDATE bookings
    SET customer_name=?, phone=?, car_model=?, service_id=?, booking_date=?, booking_time=?, status=?
    WHERE id=?
  `;
  const values = [customer_name, phone, car_model, service_id, booking_date, booking_time, status, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking updated successfully!' });
  });
});

// ─── DELETE - DELETE /api/bookings/:id ─────────────────────────
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM bookings WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully!' });
  });
});

module.exports = router;
