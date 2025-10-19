module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    noteId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Notes',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return Comment;
};

