const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../models');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('collegeId').notEmpty().withMessage('College is required'),
  body('departmentName').notEmpty().withMessage('Department is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, phone, collegeId, departmentName, year, rollNumber } = req.body;

    // Check if user exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Verify college exists
    const college = await db.College.findByPk(collegeId);
    if (!college) {
      return res.status(400).json({ message: 'Invalid college selected' });
    }

    // Find or create department
    let department = await db.Department.findOne({
      where: {
        name: departmentName,
        collegeId: collegeId
      }
    });

    if (!department) {
      department = await db.Department.create({
        name: departmentName,
        collegeId: collegeId
      });
    }

    // Create user (no role field needed since we removed it)
    const user = await db.User.create({
      name,
      email,
      password,
      phone,
      collegeId,
      departmentId: department.id,
      year,
      rollNumber,
      isApproved: false
    });

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // First check if it's an admin
    let admin = await db.Admin.findOne({
      where: {
        email,
        isActive: true
      }
    });

    if (admin) {
      // Check admin password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      await admin.updateLastLogin();

      const token = generateToken(admin.id);

      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          adminId: admin.adminId,
          permissions: admin.permissions,
          isApproved: admin.isApproved,
          isAdmin: true
        }
      });
    }

    // If not admin, check regular user
    const user = await db.User.findOne({
      where: { email },
      include: [
        { model: db.College, as: 'college' },
        { model: db.Department, as: 'department' }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if approved
    if (!user.isApproved) {
      return res.status(403).json({
        message: 'Your account is pending approval by admin',
        isApproved: false
      });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        college: user.college,
        department: user.department,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // First check if it's an admin
    let admin = await db.Admin.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (admin) {
      return res.json({
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          adminId: admin.adminId,
          permissions: admin.permissions,
          isActive: admin.isActive,
          isApproved: admin.isApproved,
          lastLogin: admin.lastLogin,
          isAdmin: true
        }
      });
    }

    // If not admin, get regular user
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: db.College, as: 'college' },
        { model: db.Department, as: 'department' }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        college: user.college,
        department: user.department,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

