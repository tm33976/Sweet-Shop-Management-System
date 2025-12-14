const Sweet = require("../models/Sweet");

exports.getSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.status(200).json(sweets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.searchSweets = async (req, res) => {
  try {
    const { query } = req.query;

    const searchRegex = new RegExp(query, "i");

    const sweets = await Sweet.find({
      $or: [{ name: searchRegex }, { category: searchRegex }],
    });

    res.status(200).json(sweets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const sweet = await Sweet.create({ name, category, price, quantity });
    res.status(201).json(sweet);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    const updatedSweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedSweet);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    await sweet.deleteOne();
    res.status(200).json({ message: "Sweet removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.purchaseSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    if (sweet.quantity < 1) {
      return res.status(400).json({ message: "Sweet is out of stock" });
    }

    sweet.quantity -= 1;
    await sweet.save();

    res.status(200).json(sweet);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.restockSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    const { quantity } = req.body;
    sweet.quantity += parseInt(quantity);
    await sweet.save();

    res.status(200).json(sweet);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
