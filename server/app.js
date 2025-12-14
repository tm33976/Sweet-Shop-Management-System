const express = require('express');
const cors = require('cors'); 
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
// (Skip connection during tests to avoid conflicts)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Middleware
app.use(express.json());

app.use(cors()); 

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sweets', require('./routes/sweetRoutes'));

module.exports = app;