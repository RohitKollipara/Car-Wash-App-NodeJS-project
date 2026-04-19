// routes/services.js - Get all services
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all services
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM services';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
