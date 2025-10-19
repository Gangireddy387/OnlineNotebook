module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true // For group chats, null for direct messages
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Chat;
};
