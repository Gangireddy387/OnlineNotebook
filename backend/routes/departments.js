const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/departments
// @desc    Get all departments (optionally filter by college)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { collegeId } = req.query;
    const where = collegeId ? { collegeId } : {};

    const departments = await db.Department.findAll({
      where,
      include: [{
        model: db.College,
        as: 'college',
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });

    res.json({ departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, collegeId, code } = req.body;

    if (!name || !collegeId) {
      return res.status(400).json({ message: 'Department name and collegeId are required' });
    }

    const department = await db.Department.create({ name, collegeId, code });

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/departments/public
// @desc    Create new department (public access for registration)
// @access  Public
router.post('/public', async (req, res) => {
  try {
    const { name, collegeId, code } = req.body;

    if (!name || !collegeId) {
      return res.status(400).json({ message: 'Department name and college are required' });
    }

    // Verify college exists
    const college = await db.College.findByPk(collegeId);
    if (!college) {
      return res.status(400).json({ message: 'Invalid college selected' });
    }

    // Check if department already exists for this college
    const existingDepartment = await db.Department.findOne({ 
      where: { 
        name, 
        collegeId 
      } 
    });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department with this name already exists in the selected college' });
    }

    const department = await db.Department.create({ 
      name, 
      collegeId, 
      code: code || name.substring(0, 3).toUpperCase()
    });

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

