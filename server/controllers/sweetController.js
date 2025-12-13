const Sweet = require('../models/Sweet');

// @desc    Get all sweets
// @route   GET /api/sweets
// @access  Public
exports.getSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.status(200).json(sweets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new sweet
// @route   POST /api/sweets
// @access  Private (Admin/User)
exports.createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity
    });

    res.status(201).json(sweet);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};