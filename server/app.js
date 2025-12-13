const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Sweet Shop API is running' });
});

module.exports = app;