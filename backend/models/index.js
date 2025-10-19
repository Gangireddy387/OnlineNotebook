const { Sequelize } = require('sequelize');
require('dotenv').config();

// Direct database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'onlinenotebook',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
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
db.Admin = require('./Admin')(sequelize, Sequelize);
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

// Admin associations
db.Admin.belongsTo(db.Admin, { foreignKey: 'createdBy', as: 'creator' });
db.Admin.belongsTo(db.Admin, { foreignKey: 'approvedBy', as: 'approver' });
db.Admin.hasMany(db.Admin, { foreignKey: 'createdBy', as: 'createdAdmins' });
db.Admin.hasMany(db.Admin, { foreignKey: 'approvedBy', as: 'approvedAdmins' });
db.Admin.hasMany(db.User, { foreignKey: 'approvedBy', as: 'approvedUsers' });

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

