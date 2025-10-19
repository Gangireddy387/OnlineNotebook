const db = require('../models');

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await db.User.findOne({
      where: { email: 'admin@onlinenotebook.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@onlinenotebook.com');
      process.exit(0);
    }

    // Get or create a system college and department for admin
    const systemCollege = await db.College.findOrCreate({
      where: { name: 'System Administration' },
      defaults: { location: 'System', type: 'Both' }
    });

    const systemDept = await db.Department.findOrCreate({
      where: { name: 'Administration', collegeId: systemCollege[0].id },
      defaults: { code: 'ADMIN' }
    });

    // Create admin user
    const admin = await db.User.create({
      name: 'Admin',
      email: 'admin@onlinenotebook.com',
      password: 'admin123',
      phone: '1234567890',
      collegeId: systemCollege[0].id,
      departmentId: systemDept[0].id,
      year: 'N/A',
      rollNumber: 'ADMIN001',
      role: 'admin',
      isApproved: true
    });

    console.log('\n✓ Admin user created successfully!');
    console.log('\nAdmin Credentials:');
    console.log('==================');
    console.log('Email: admin@onlinenotebook.com');
    console.log('Password: admin123');
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

