const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.College = require('./College')(sequelize, Sequelize);
db.Department = require('./Department')(sequelize, Sequelize);
db.Subject = require('./Subject')(sequelize, Sequelize);
db.Note = require('./Note')(sequelize, Sequelize);
db.Comment = require('./Comment')(sequelize, Sequelize);

// Define associations
// User associations
db.User.belongsTo(db.College, { foreignKey: 'collegeId', as: 'college' });
db.User.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });
db.User.hasMany(db.Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });

// College associations
db.College.hasMany(db.Department, { foreignKey: 'collegeId', onDelete: 'CASCADE' });
db.College.hasMany(db.User, { foreignKey: 'collegeId', onDelete: 'SET NULL' });
db.College.hasMany(db.Note, { foreignKey: 'collegeId', onDelete: 'SET NULL' });

// Department associations
db.Department.belongsTo(db.College, { foreignKey: 'collegeId', as: 'college' });
db.Department.hasMany(db.Subject, { foreignKey: 'departmentId', onDelete: 'CASCADE' });
db.Department.hasMany(db.User, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
db.Department.hasMany(db.Note, { foreignKey: 'departmentId', onDelete: 'SET NULL' });

// Subject associations
db.Subject.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });
db.Subject.hasMany(db.Note, { foreignKey: 'subjectId', onDelete: 'SET NULL' });

// Note associations
db.Note.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Note.belongsTo(db.College, { foreignKey: 'collegeId', as: 'college' });
db.Note.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });
db.Note.belongsTo(db.Subject, { foreignKey: 'subjectId', as: 'subject' });
db.Note.hasMany(db.Comment, { foreignKey: 'noteId', onDelete: 'CASCADE' });

// Comment associations
db.Comment.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Comment.belongsTo(db.Note, { foreignKey: 'noteId', as: 'note' });

module.exports = db;

