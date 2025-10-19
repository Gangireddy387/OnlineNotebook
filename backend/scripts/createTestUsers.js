const db = require('../models');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    console.log('Creating test users...');
    
    // Get the first college and department for test users
    const college = await db.College.findOne();
    const department = await db.Department.findOne();
    
    if (!college || !department) {
      console.log('Please create colleges and departments first');
      return;
    }
    
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        collegeId: college.id,
        departmentId: department.id,
        year: '3rd Year',
        rollNumber: 'CS001',
        isApproved: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'password123',
        collegeId: college.id,
        departmentId: department.id,
        year: '2nd Year',
        rollNumber: 'CS002',
        isApproved: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike@test.com',
        password: 'password123',
        collegeId: college.id,
        departmentId: department.id,
        year: '4th Year',
        rollNumber: 'CS003',
        isApproved: true
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@test.com',
        password: 'password123',
        collegeId: college.id,
        departmentId: department.id,
        year: '1st Year',
        rollNumber: 'CS004',
        isApproved: true
      }
    ];
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await db.User.findOne({ where: { email: userData.email } });
      
      if (!existingUser) {
        const user = await db.User.create(userData);
        console.log(`Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`User already exists: ${existingUser.name} (${existingUser.email})`);
      }
    }
    
    console.log('Test users creation completed!');
    console.log('\nTest user credentials:');
    console.log('Email: john@test.com, Password: password123');
    console.log('Email: jane@test.com, Password: password123');
    console.log('Email: mike@test.com, Password: password123');
    console.log('Email: sarah@test.com, Password: password123');
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    process.exit(0);
  }
}

createTestUsers();
