module.exports = (sequelize, DataTypes) => {
  const OnlineStatus = sequelize.define('OnlineStatus', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      unique: true
    },
    status: {
      type: DataTypes.ENUM('online', 'away', 'offline'),
      defaultValue: 'offline'
    },
    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return OnlineStatus;
};
