require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const sweetRoutes = require('./routes/sweetRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes); 

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Sweet Shop API is running' });
});

module.exports = app;