module.exports = (sequelize, DataTypes) => {
  const ChatRequest = sequelize.define('ChatRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false
      // Removed foreign key constraint to support both Users and Admins
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false
      // Removed foreign key constraint to support both Users and Admins
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
    timestamps: true,
    indexes: [
      {
        fields: ['requesterId']
      },
      {
        fields: ['receiverId']
      },
      {
        fields: ['status']
      }
    ]
  });

  return ChatRequest;
};
