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
        as: 'department',
        attributes: ['id', 'name'],
        include: [{
          model: db.College,
          as: 'college',
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

// @route   POST /api/subjects/public
// @desc    Create new subject (public access for uploads)
// @access  Public
router.post('/public', async (req, res) => {
  try {
    console.log('Subject creation request:', req.body);
    const { name, departmentId, code, semester } = req.body;

    if (!name || !departmentId) {
      console.log('Validation failed: missing name or departmentId');
      return res.status(400).json({ message: 'Subject name and department are required' });
    }

    // Verify department exists
    const department = await db.Department.findByPk(departmentId);
    if (!department) {
      console.log('Department not found:', departmentId);
      return res.status(400).json({ message: 'Invalid department selected' });
    }
    console.log('Department found:', department.name);

    // Check if subject already exists for this department
    const existingSubject = await db.Subject.findOne({ 
      where: { 
        name, 
        departmentId 
      } 
    });
    if (existingSubject) {
      console.log('Subject already exists:', name);
      return res.status(400).json({ message: 'Subject with this name already exists in the selected department' });
    }

    console.log('Creating subject with data:', { name, departmentId, code, semester });
    const subject = await db.Subject.create({ 
      name, 
      departmentId, 
      code: code || name.substring(0, 3).toUpperCase(),
      semester: semester || null
    });
    console.log('Subject created successfully:', subject.id);

    // Fetch the subject with department details
    const subjectWithDetails = await db.Subject.findByPk(subject.id, {
      include: [{
        model: db.Department,
        as: 'department',
        attributes: ['id', 'name'],
        include: [{
          model: db.College,
          as: 'college',
          attributes: ['id', 'name']
        }]
      }]
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject: subjectWithDetails
    });
  } catch (error) {
    console.error('Subject creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

