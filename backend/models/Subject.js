module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Subject;
};

