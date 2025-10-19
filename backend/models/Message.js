module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
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
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('text', 'emoji', 'image', 'file', 'system'),
      defaultValue: 'text'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    replyTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return Message;
};
