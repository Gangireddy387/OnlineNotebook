module.exports = (sequelize, DataTypes) => {
  const College = sequelize.define('College', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('Engineering', 'Degree', 'Both'),
      defaultValue: 'Both'
    }
  }, {
    timestamps: true
  });

  return College;
};

