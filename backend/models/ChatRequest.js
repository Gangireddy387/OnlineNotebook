module.exports = (sequelize, DataTypes) => {
  const ChatRequest = sequelize.define('ChatRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      defaultValue: 'pending'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return ChatRequest;
};
