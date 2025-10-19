const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/colleges
// @desc    Get all colleges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const colleges = await db.College.findAll({
      order: [['name', 'ASC']]
    });

    res.json({ colleges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/colleges
// @desc    Create new college
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, location, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'College name is required' });
    }

    const college = await db.College.create({ name, location, type });

    res.status(201).json({
      message: 'College created successfully',
      college
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/colleges/public
// @desc    Create new college (public access for registration)
// @access  Public
router.post('/public', async (req, res) => {
  try {
    const { name, location, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'College name is required' });
    }

    // Check if college already exists
    const existingCollege = await db.College.findOne({ where: { name } });
    if (existingCollege) {
      return res.status(400).json({ message: 'College with this name already exists' });
    }

    const college = await db.College.create({ 
      name, 
      location: location || 'Unknown', 
      type: type || 'Both' 
    });

    res.status(201).json({
      message: 'College created successfully',
      college
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

