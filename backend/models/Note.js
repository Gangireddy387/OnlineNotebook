module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    collegeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Colleges',
        key: 'id'
      }
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Subjects',
        key: 'id'
      }
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    timestamps: true
  });

  return Note;
};

