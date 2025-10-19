const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect, isApproved } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: db.Note,
        attributes: ['id', 'title', 'createdAt']
      }]
    });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, year } = req.body;
    
    const user = await db.User.findByPk(req.user.id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (year) user.year = year;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        year: user.year
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

