module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.ENUM(
        // Engineering Departments
        'Computer Science Engineering',
        'Electronics and Communication Engineering', 
        'Mechanical Engineering',
        'Civil Engineering',
        'Electrical Engineering',
        'Information Technology',
        'Aerospace Engineering',
        'Chemical Engineering',
        'Biotechnology Engineering',
        'Automobile Engineering',
        // Degree Departments
        'Bachelor of Science',
        'Bachelor of Commerce',
        'Bachelor of Arts',
        'Bachelor of Business Administration',
        'Bachelor of Computer Applications',
        'Bachelor of Technology',
        'Master of Science',
        'Master of Commerce',
        'Master of Arts',
        'Master of Business Administration'
      ),
      allowNull: false
    },
    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Colleges',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return Department;
};

