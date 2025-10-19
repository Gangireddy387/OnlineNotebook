module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Colleges',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Department;
};

