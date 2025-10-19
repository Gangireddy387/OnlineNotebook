const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect, authorize, canApprove } = require('../middleware/auth');

// @route   GET /api/admin/pending-users
// @desc    Get all pending user approvals
// @access  Private (Admin only)
router.get('/pending-users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await db.User.findAll({
      where: { isApproved: false },
      attributes: { exclude: ['password'] },
      include: [
        { model: db.College, as: 'college' },
        { model: db.Department, as: 'department' }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/approve-user/:id
// @desc    Approve user registration
// @access  Private (Super Admin and Admin only)
router.put('/approve-user/:id', protect, canApprove, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save();

    res.json({
      message: 'User approved successfully',
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

// @route   DELETE /api/admin/reject-user/:id
// @desc    Reject and delete user registration
// @access  Private (Super Admin and Admin only)
router.delete('/reject-user/:id', protect, canApprove, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot reject admin user' });
    }

    await user.destroy();

    res.json({ message: 'User registration rejected and deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: db.College, as: 'college' },
        { model: db.Department, as: 'department' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const pendingUsers = await db.User.count({ where: { isApproved: false } });
    const approvedUsers = await db.User.count({ where: { isApproved: true } });
    const totalAdmins = await db.Admin.count();
    const pendingAdmins = await db.Admin.count({ where: { isApproved: false } });
    const totalNotes = await db.Note.count();
    const totalComments = await db.Comment.count();
    const totalDownloads = await db.Note.sum('downloads');

    res.json({
      stats: {
        totalUsers,
        pendingUsers,
        approvedUsers,
        totalAdmins,
        pendingAdmins,
        totalNotes,
        totalComments,
        totalDownloads: totalDownloads || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/pending-admins
// @desc    Get all pending admin approvals (super_admin only)
// @access  Private (Super Admin only)
router.get('/pending-admins', protect, authorize('super_admin'), async (req, res) => {
  try {
    const admins = await db.Admin.findAll({
      where: { 
        isApproved: false,
        role: { [db.Sequelize.Op.ne]: 'super_admin' } // Exclude super_admin
      },
      attributes: { exclude: ['password'] },
      include: [
        { model: db.Admin, as: 'creator', attributes: ['name', 'email', 'adminId'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/approve-admin/:id
// @desc    Approve admin registration (super_admin only)
// @access  Private (Super Admin only)
router.put('/approve-admin/:id', protect, authorize('super_admin'), async (req, res) => {
  try {
    const admin = await db.Admin.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.role === 'super_admin') {
      return res.status(400).json({ message: 'Super admin does not need approval' });
    }

    await admin.approveAdmin(req.user.id);

    res.json({
      message: 'Admin approved successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        adminId: admin.adminId,
        isApproved: admin.isApproved
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/reject-admin/:id
// @desc    Reject and delete admin registration (super_admin only)
// @access  Private (Super Admin only)
router.delete('/reject-admin/:id', protect, authorize('super_admin'), async (req, res) => {
  try {
    const admin = await db.Admin.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.role === 'super_admin') {
      return res.status(400).json({ message: 'Cannot reject super admin' });
    }

    await admin.destroy();

    res.json({ message: 'Admin registration rejected and deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/admins
// @desc    Get all admins (super_admin only)
// @access  Private (Super Admin only)
router.get('/admins', protect, authorize('super_admin'), async (req, res) => {
  try {
    const admins = await db.Admin.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: db.Admin, as: 'creator', attributes: ['name', 'email', 'adminId'] },
        { model: db.Admin, as: 'approver', attributes: ['name', 'email', 'adminId'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

