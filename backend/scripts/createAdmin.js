const db = require('../models');

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await db.Admin.findOne({
      where: { email: 'admin@onlinenotebook.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@onlinenotebook.com');
      process.exit(0);
    }

    // Create admin user using the new Admin model
    const admin = await db.Admin.create({
      name: 'System Administrator',
      email: 'admin@onlinenotebook.com',
      password: 'admin123',
      phone: '1234567890',
      adminId: 'ADMIN001',
      role: 'super_admin',
      permissions: {
        canManageUsers: true,
        canManageNotes: true,
        canManageColleges: true,
        canManageDepartments: true,
        canManageSubjects: true,
        canViewAnalytics: true,
        canCreateAdmins: true
      },
      isActive: true,
      isApproved: true, // super_admin is auto-approved
      approvedAt: new Date()
    });

    console.log('\n✓ Admin user created successfully!');
    console.log('\nAdmin Credentials:');
    console.log('==================');
    console.log('Email: admin@onlinenotebook.com');
    console.log('Password: admin123');
    console.log('Role: super_admin');
    console.log('Admin ID: ADMIN001');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Wait for database connection
db.sequelize.sync().then(() => {
  createAdmin();
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});

