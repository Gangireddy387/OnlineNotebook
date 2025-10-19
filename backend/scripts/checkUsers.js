const db = require('../models');

async function checkUsers() {
  try {
    console.log('Checking all users in database...');
    
    const allUsers = await db.User.findAll({
      include: [
        { model: db.College, as: 'college', attributes: ['name'] },
        { model: db.Department, as: 'department', attributes: ['name'] }
      ]
    });
    
    console.log(`Total users found: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   - College: ${user.college?.name || 'N/A'}`);
      console.log(`   - Department: ${user.department?.name || 'N/A'}`);
      console.log(`   - Approved: ${user.isApproved}`);
      console.log(`   - Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Check approved users specifically
    const approvedUsers = await db.User.findAll({
      where: { isApproved: true },
      include: [
        { model: db.College, as: 'college', attributes: ['name'] },
        { model: db.Department, as: 'department', attributes: ['name'] }
      ]
    });
    
    console.log(`Approved users: ${approvedUsers.length}`);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
