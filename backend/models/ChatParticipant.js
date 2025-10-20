module.exports = (sequelize, DataTypes) => {
  const ChatParticipant = sequelize.define('ChatParticipant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Chats',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
      // Removed foreign key constraint to support both Users and Admins
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member'
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });

  return ChatParticipant;
};
