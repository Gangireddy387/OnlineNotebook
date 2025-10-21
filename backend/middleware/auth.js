const jwt = require('jsonwebtoken');
const db = require('../models');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // First check if it's an admin
    let admin = await db.Admin.findByPk(decoded.id);
    if (admin) {
      // Check if admin is approved (super_admin is always approved)
      if (!admin.isApproved && admin.role !== 'super_admin') {
        return res.status(403).json({
          message: 'Your admin account is pending approval by super admin',
          isApproved: false
        });
      }

      req.user = admin;
      req.userType = 'admin';
      return next();
    }

    // If not admin, check regular user
    let user = await db.User.findByPk(decoded.id);
    if (user) {
      req.user = user;
      req.userType = 'user';
      return next();
    }

    return res.status(401).json({ message: 'User not found' });
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // For admin users, check their role
    if (req.userType === 'admin') {
      // super_admin can access any admin route
      if (req.user.role === 'super_admin' || roles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({
        message: `Admin role ${req.user.role} is not authorized to access this route`
      });
    } else {
      // For regular users, they don't have roles in the new system
      return res.status(403).json({
        message: 'Only administrators can access this route'
      });
    }
  };
};

// New middleware for approval permissions (only super_admin and admin can approve)
exports.canApprove = (req, res, next) => {
  if (req.userType === 'admin') {
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      return next();
    }

    return res.status(403).json({
      message: 'Only super admin and admin can approve users'
    });
  } else {
    return res.status(403).json({
      message: 'Only administrators can access this route'
    });
  }
};

exports.isApproved = (req, res, next) => {
  // Only check approval for regular users, not admins
  if (req.userType === 'user' && !req.user.isApproved) {
    return res.status(403).json({
      message: 'Your account is pending approval by admin'
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      message: 'Only administrators can access this route'
    });
  }
  next();
};

