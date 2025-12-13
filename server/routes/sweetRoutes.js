const express = require('express');
const router = express.Router();
const { 
  getSweets, 
  searchSweets, // <--- Import the new function
  createSweet, 
  updateSweet, 
  deleteSweet,
  purchaseSweet,
  restockSweet
} = require('../controllers/sweetController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.get('/search', searchSweets); // <--- MUST be before other routes
router.get('/', getSweets);

// Protected Routes (Admin/User)
router.post('/', protect, createSweet);
router.put('/:id', protect, updateSweet);
router.delete('/:id', protect, deleteSweet);

// Inventory Routes
router.post('/:id/purchase', protect, purchaseSweet);
router.post('/:id/restock', protect, restockSweet);

module.exports = router;