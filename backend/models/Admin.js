const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    adminId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'moderator'),
      defaultValue: 'admin'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        canManageUsers: true,
        canManageNotes: true,
        canManageColleges: true,
        canManageDepartments: true,
        canManageSubjects: true,
        canViewAnalytics: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: function() {
        // super_admin is auto-approved, others need approval
        return this.role === 'super_admin';
      }
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      }
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (admin) => {
        if (admin.password) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
        
        // Auto-approve super_admin users
        if (admin.role === 'super_admin') {
          admin.isApproved = true;
          admin.approvedAt = new Date();
        }
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
        
        // Auto-approve if role changed to super_admin
        if (admin.changed('role') && admin.role === 'super_admin') {
          admin.isApproved = true;
          admin.approvedAt = new Date();
        }
      }
    }
  });

  Admin.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  Admin.prototype.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
  };

  Admin.prototype.hasPermission = function(permission) {
    return this.permissions && this.permissions[permission] === true;
  };

  Admin.prototype.approveAdmin = async function(approvedByAdminId) {
    this.isApproved = true;
    this.approvedBy = approvedByAdminId;
    this.approvedAt = new Date();
    await this.save();
  };

  Admin.prototype.needsApproval = function() {
    return !this.isApproved && this.role !== 'super_admin';
  };

  Admin.prototype.isSuperior = function() {
    return this.role === 'super_admin' || (this.isApproved && this.hasPermission('canCreateAdmins'));
  };

  // Chat-related methods for admin users
  Admin.prototype.canSendChatRequests = function() {
    return this.isActive && this.isApproved;
  };

  Admin.prototype.canReceiveChatRequests = function() {
    return this.isActive && this.isApproved;
  };

  Admin.prototype.getDisplayName = function() {
    return this.name || 'Unknown Admin';
  };

  Admin.prototype.getDisplayInfo = function() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      adminId: this.adminId,
      isAdmin: true,
      isActive: this.isActive,
      isApproved: this.isApproved
    };
  };

  return Admin;
};
