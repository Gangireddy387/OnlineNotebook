const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/subjects
// @desc    Get all subjects (optionally filter by department)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const where = departmentId ? { departmentId } : {};

    const subjects = await db.Subject.findAll({
      where,
      include: [{
        model: db.Department,
        attributes: ['id', 'name'],
        include: [{
          model: db.College,
          attributes: ['id', 'name']
        }]
      }],
      order: [['name', 'ASC']]
    });

    res.json({ subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, departmentId, code, semester } = req.body;

    if (!name || !departmentId) {
      return res.status(400).json({ message: 'Subject name and departmentId are required' });
    }

    const subject = await db.Subject.create({ name, departmentId, code, semester });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

