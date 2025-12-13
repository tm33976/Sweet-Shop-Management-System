const express = require('express');
const router = express.Router();
const { getSweets, createSweet } = require('../controllers/sweetController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view sweets
router.get('/', getSweets);

// Protected route to add sweets (Must have valid token)
router.post('/', protect, createSweet);

module.exports = router;