const db = require('../models');

async function seedData() {
  try {
    console.log('Seeding database with sample data...\n');

    // Create sample colleges
    console.log('Creating colleges...');
    const colleges = await Promise.all([
      db.College.findOrCreate({
        where: { name: 'ABC Engineering College' },
        defaults: { location: 'Mumbai', type: 'Engineering' }
      }),
      db.College.findOrCreate({
        where: { name: 'XYZ Degree College' },
        defaults: { location: 'Delhi', type: 'Degree' }
      }),
      db.College.findOrCreate({
        where: { name: 'PQR University' },
        defaults: { location: 'Bangalore', type: 'Both' }
      })
    ]);

    const abc = colleges[0][0];
    const xyz = colleges[1][0];
    const pqr = colleges[2][0];

    console.log('✓ Colleges created');

    // Create sample departments
    console.log('Creating departments...');
    const departments = await Promise.all([
      // ABC Engineering College
      db.Department.findOrCreate({
        where: { name: 'Computer Science Engineering', collegeId: abc.id },
        defaults: { code: 'CSE' }
      }),
      db.Department.findOrCreate({
        where: { name: 'Electronics and Communication', collegeId: abc.id },
        defaults: { code: 'ECE' }
      }),
      db.Department.findOrCreate({
        where: { name: 'Mechanical Engineering', collegeId: abc.id },
        defaults: { code: 'MECH' }
      }),
      // XYZ Degree College
      db.Department.findOrCreate({
        where: { name: 'Bachelor of Science', collegeId: xyz.id },
        defaults: { code: 'BSC' }
      }),
      db.Department.findOrCreate({
        where: { name: 'Bachelor of Commerce', collegeId: xyz.id },
        defaults: { code: 'BCOM' }
      }),
      db.Department.findOrCreate({
        where: { name: 'Bachelor of Arts', collegeId: xyz.id },
        defaults: { code: 'BA' }
      }),
      // PQR University
      db.Department.findOrCreate({
        where: { name: 'Computer Science', collegeId: pqr.id },
        defaults: { code: 'CS' }
      }),
      db.Department.findOrCreate({
        where: { name: 'Information Technology', collegeId: pqr.id },
        defaults: { code: 'IT' }
      })
    ]);

    const cse = departments[0][0];
    const ece = departments[1][0];
    const mech = departments[2][0];
    const bsc = departments[3][0];
    const bcom = departments[4][0];
    const ba = departments[5][0];
    const cs = departments[6][0];
    const it = departments[7][0];

    console.log('✓ Departments created');

    // Create sample subjects
    console.log('Creating subjects...');
    await Promise.all([
      // CSE Subjects
      db.Subject.findOrCreate({
        where: { name: 'Data Structures', departmentId: cse.id },
        defaults: { code: 'CS201', semester: '3rd Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Database Management Systems', departmentId: cse.id },
        defaults: { code: 'CS301', semester: '5th Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Operating Systems', departmentId: cse.id },
        defaults: { code: 'CS302', semester: '5th Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Computer Networks', departmentId: cse.id },
        defaults: { code: 'CS401', semester: '7th Sem' }
      }),
      // ECE Subjects
      db.Subject.findOrCreate({
        where: { name: 'Digital Electronics', departmentId: ece.id },
        defaults: { code: 'EC201', semester: '3rd Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Signals and Systems', departmentId: ece.id },
        defaults: { code: 'EC301', semester: '5th Sem' }
      }),
      // MECH Subjects
      db.Subject.findOrCreate({
        where: { name: 'Thermodynamics', departmentId: mech.id },
        defaults: { code: 'ME201', semester: '3rd Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Fluid Mechanics', departmentId: mech.id },
        defaults: { code: 'ME301', semester: '5th Sem' }
      }),
      // BSC Subjects
      db.Subject.findOrCreate({
        where: { name: 'Physics', departmentId: bsc.id },
        defaults: { code: 'PHY101', semester: '1st Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Chemistry', departmentId: bsc.id },
        defaults: { code: 'CHE101', semester: '1st Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Mathematics', departmentId: bsc.id },
        defaults: { code: 'MAT101', semester: '1st Sem' }
      }),
      // BCOM Subjects
      db.Subject.findOrCreate({
        where: { name: 'Financial Accounting', departmentId: bcom.id },
        defaults: { code: 'ACC101', semester: '1st Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Business Economics', departmentId: bcom.id },
        defaults: { code: 'ECO101', semester: '1st Sem' }
      }),
      // BA Subjects
      db.Subject.findOrCreate({
        where: { name: 'English Literature', departmentId: ba.id },
        defaults: { code: 'ENG101', semester: '1st Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'History', departmentId: ba.id },
        defaults: { code: 'HIS101', semester: '1st Sem' }
      }),
      // CS Subjects
      db.Subject.findOrCreate({
        where: { name: 'Algorithms', departmentId: cs.id },
        defaults: { code: 'CS202', semester: '4th Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Artificial Intelligence', departmentId: cs.id },
        defaults: { code: 'CS402', semester: '8th Sem' }
      }),
      // IT Subjects
      db.Subject.findOrCreate({
        where: { name: 'Web Technologies', departmentId: it.id },
        defaults: { code: 'IT301', semester: '5th Sem' }
      }),
      db.Subject.findOrCreate({
        where: { name: 'Software Engineering', departmentId: it.id },
        defaults: { code: 'IT302', semester: '5th Sem' }
      })
    ]);

    console.log('✓ Subjects created');

    console.log('\n✓ Database seeded successfully!\n');
    console.log('Summary:');
    console.log('--------');
    console.log('Colleges: 3');
    console.log('Departments: 8');
    console.log('Subjects: 19');
    console.log('\nYou can now start using the application!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Wait for database connection
db.sequelize.sync().then(() => {
  seedData();
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});

