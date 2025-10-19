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
db.Chat = require('./Chat')(sequelize, Sequelize);
db.Message = require('./Message')(sequelize, Sequelize);
db.ChatRequest = require('./ChatRequest')(sequelize, Sequelize);
db.ChatParticipant = require('./ChatParticipant')(sequelize, Sequelize);
db.OnlineStatus = require('./OnlineStatus')(sequelize, Sequelize);

// Define associations
// User associations
db.User.belongsTo(db.College, { foreignKey: 'collegeId', as: 'college' });
db.User.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });
db.User.hasMany(db.Note, { foreignKey: 'userId', as: 'notes', onDelete: 'CASCADE' });
db.User.hasMany(db.Comment, { foreignKey: 'userId', as: 'comments', onDelete: 'CASCADE' });

// Admin associations
db.Admin.belongsTo(db.Admin, { foreignKey: 'createdBy', as: 'creator' });
db.Admin.belongsTo(db.Admin, { foreignKey: 'approvedBy', as: 'approver' });
db.Admin.hasMany(db.Admin, { foreignKey: 'createdBy', as: 'createdAdmins' });
db.Admin.hasMany(db.Admin, { foreignKey: 'approvedBy', as: 'approvedAdmins' });
db.Admin.hasMany(db.User, { foreignKey: 'approvedBy', as: 'approvedUsers' });

// College associations
db.College.hasMany(db.Department, { foreignKey: 'collegeId', as: 'departments', onDelete: 'CASCADE' });
db.College.hasMany(db.User, { foreignKey: 'collegeId', as: 'users', onDelete: 'SET NULL' });
db.College.hasMany(db.Note, { foreignKey: 'collegeId', as: 'notes', onDelete: 'SET NULL' });

// Department associations
db.Department.belongsTo(db.College, { foreignKey: 'collegeId', as: 'college' });
db.Department.hasMany(db.Subject, { foreignKey: 'departmentId', as: 'subjects', onDelete: 'CASCADE' });
db.Department.hasMany(db.User, { foreignKey: 'departmentId', as: 'users', onDelete: 'SET NULL' });
db.Department.hasMany(db.Note, { foreignKey: 'departmentId', as: 'notes', onDelete: 'SET NULL' });

// Subject associations
db.Subject.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });
db.Subject.hasMany(db.Note, { foreignKey: 'subjectId', as: 'notes', onDelete: 'SET NULL' });

// Note associations
db.Note.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Note.belongsTo(db.College, { foreignKey: 'collegeId', as: 'college' });
db.Note.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });
db.Note.belongsTo(db.Subject, { foreignKey: 'subjectId', as: 'subject' });
db.Note.hasMany(db.Comment, { foreignKey: 'noteId', as: 'comments', onDelete: 'CASCADE' });

// Comment associations
db.Comment.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Comment.belongsTo(db.Note, { foreignKey: 'noteId', as: 'note' });

// Chat associations
db.Chat.belongsTo(db.User, { foreignKey: 'createdBy', as: 'creator' });
db.Chat.hasMany(db.Message, { foreignKey: 'chatId', as: 'messages', onDelete: 'CASCADE' });
db.Chat.hasMany(db.ChatParticipant, { foreignKey: 'chatId', as: 'participants', onDelete: 'CASCADE' });
db.Chat.belongsToMany(db.User, { through: db.ChatParticipant, foreignKey: 'chatId', as: 'users' });

// Message associations
db.Message.belongsTo(db.Chat, { foreignKey: 'chatId', as: 'chat' });
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.Message.belongsTo(db.Message, { foreignKey: 'replyTo', as: 'replyToMessage' });
db.Message.hasMany(db.Message, { foreignKey: 'replyTo', as: 'replies' });

// ChatRequest associations
db.ChatRequest.belongsTo(db.User, { foreignKey: 'requesterId', as: 'requester' });
db.ChatRequest.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });

// ChatParticipant associations
db.ChatParticipant.belongsTo(db.Chat, { foreignKey: 'chatId', as: 'chat' });
db.ChatParticipant.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.belongsToMany(db.Chat, { through: db.ChatParticipant, foreignKey: 'userId', as: 'chats' });

// OnlineStatus associations
db.OnlineStatus.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.hasOne(db.OnlineStatus, { foreignKey: 'userId', as: 'onlineStatus' });

// Additional User associations for chat
db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
db.User.hasMany(db.ChatRequest, { foreignKey: 'requesterId', as: 'sentChatRequests', onDelete: 'CASCADE' });
db.User.hasMany(db.ChatRequest, { foreignKey: 'receiverId', as: 'receivedChatRequests', onDelete: 'CASCADE' });
db.User.hasMany(db.ChatParticipant, { foreignKey: 'userId', as: 'chatParticipants', onDelete: 'CASCADE' });

module.exports = db;

