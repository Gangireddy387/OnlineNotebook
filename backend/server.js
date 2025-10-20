const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database
const db = require('./models');

// Sync database with automatic schema updates
const syncOptions = {
  alter: true,           // Modify existing tables to match model definitions
  force: false,          // Don't drop tables (safer for production)
  logging: console.log,  // Show SQL queries for debugging
  benchmark: true        // Show execution time
};

// Environment-specific sync options
if (process.env.NODE_ENV === 'development') {
  syncOptions.logging = console.log;
} else if (process.env.NODE_ENV === 'production') {
  syncOptions.logging = false;
}

db.sequelize.sync(syncOptions).then(() => {
  console.log('✅ Database synced successfully');
}).catch(err => {
  console.error('❌ Error syncing database:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  
  // Update online status
  updateOnlineStatus(socket.userId, 'online', socket.id);
  
  // Handle joining chat rooms
  socket.on('join_chat', async (chatId) => {
    try {
      // Verify user is participant of this chat
      const participant = await db.ChatParticipant.findOne({
        where: { chatId, userId: socket.userId }
      });
      
      if (!participant) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }
      
      socket.join(`chat_${chatId}`);
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });
  
  // Handle leaving chat rooms
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
  });
  
  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content, type = 'text', replyTo } = data;
      
      // Verify user is participant of this chat
      const participant = await db.ChatParticipant.findOne({
        where: { chatId, userId: socket.userId }
      });
      
      if (!participant) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }
      
      // Save message to database
      const message = await db.Message.create({
        chatId,
        senderId: socket.userId,
        content,
        type,
        replyTo
      });
      
      // Update chat's last message time
      await db.Chat.update(
        { lastMessageAt: new Date() },
        { where: { id: chatId } }
      );
      
      // Fetch message with sender info using manual lookup
      let sender = null;
      const userSender = await db.User.findByPk(socket.userId, { attributes: ['id', 'name', 'email'] });
      if (userSender) {
        sender = { id: userSender.id, name: userSender.name, email: userSender.email, isAdmin: false };
      } else {
        const adminSender = await db.Admin.findByPk(socket.userId, { attributes: ['id', 'name', 'email', 'role'] });
        if (adminSender) {
          sender = { id: adminSender.id, name: adminSender.name, email: adminSender.email, isAdmin: true, role: adminSender.role };
        }
      }
      
      let replyToMessage = null;
      if (replyTo) {
        replyToMessage = await db.Message.findByPk(replyTo, { attributes: ['id', 'content', 'senderId'] });
        if (replyToMessage) {
          let replySender = null;
          const userReplySender = await db.User.findByPk(replyToMessage.senderId, { attributes: ['id', 'name'] });
          if (userReplySender) {
            replySender = { id: userReplySender.id, name: userReplySender.name, isAdmin: false };
          } else {
            const adminReplySender = await db.Admin.findByPk(replyToMessage.senderId, { attributes: ['id', 'name'] });
            if (adminReplySender) {
              replySender = { id: adminReplySender.id, name: adminReplySender.name, isAdmin: true };
            }
          }
          replyToMessage = { ...replyToMessage.toJSON(), sender: replySender || { id: replyToMessage.senderId, name: 'Unknown User', isAdmin: false } };
        }
      }
      
      const messageWithSender = {
        ...message.toJSON(),
        sender: sender || { id: socket.userId, name: 'Unknown User', email: 'No email', isAdmin: false },
        replyToMessage
      };
      
      // Emit to all users in the chat
      io.to(`chat_${chatId}`).emit('new_message', messageWithSender);
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
      console.error('Error sending message:', error);
    }
  });
  
  // Handle typing indicators
  socket.on('typing', async (data) => {
    try {
      const { chatId, isTyping } = data;
      
      // Verify user is participant of this chat
      const participant = await db.ChatParticipant.findOne({
        where: { chatId, userId: socket.userId }
      });
      
      if (!participant) {
        return; // Silently ignore if user is not a participant
      }
      
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        chatId,
        isTyping
      });
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  });
  
  // Handle message read status
  socket.on('mark_read', async (data) => {
    try {
      const { chatId, messageId } = data;
      
      // Verify user is participant of this chat
      const participant = await db.ChatParticipant.findOne({
        where: { chatId, userId: socket.userId }
      });
      
      if (!participant) {
        return; // Silently ignore if user is not a participant
      }
      
      if (messageId) {
        await db.Message.update(
          { isRead: true, readAt: new Date() },
          { where: { id: messageId } }
        );
      } else {
        // Mark all messages in chat as read
        await db.Message.update(
          { isRead: true, readAt: new Date() },
          { where: { chatId, senderId: { [db.Sequelize.Op.ne]: socket.userId } } }
        );
      }
      
      socket.to(`chat_${chatId}`).emit('message_read', {
        userId: socket.userId,
        chatId,
        messageId
      });
      
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });
  
  // Handle chat requests
  socket.on('send_chat_request', async (data) => {
    try {
      const { receiverId, message } = data;
      
      const chatRequest = await db.ChatRequest.create({
        requesterId: socket.userId,
        receiverId,
        message
      });
      
      // Fetch requester details manually
      let requester = null;
      const userRequester = await db.User.findByPk(socket.userId, { attributes: ['id', 'name', 'email'] });
      if (userRequester) {
        requester = { id: userRequester.id, name: userRequester.name, email: userRequester.email, isAdmin: false };
      } else {
        const adminRequester = await db.Admin.findByPk(socket.userId, { attributes: ['id', 'name', 'email', 'role'] });
        if (adminRequester) {
          requester = { id: adminRequester.id, name: adminRequester.name, email: adminRequester.email, isAdmin: true, role: adminRequester.role };
        }
      }
      
      const requestWithRequester = {
        ...chatRequest.toJSON(),
        requester: requester || { id: socket.userId, name: 'Unknown User', email: 'No email', isAdmin: false }
      };
      
      // Emit to receiver
      io.to(`user_${receiverId}`).emit('chat_request_received', requestWithRequester);
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to send chat request' });
      console.error('Error sending chat request:', error);
    }
  });
  
  // Handle chat request response
  socket.on('respond_chat_request', async (data) => {
    try {
      const { requestId, status } = data;
      
      const chatRequest = await db.ChatRequest.findByPk(requestId);
      
      if (!chatRequest) {
        return socket.emit('error', { message: 'Chat request not found' });
      }
      
      await chatRequest.update({
        status,
        respondedAt: new Date()
      });
      
      // Fetch receiver details manually
      let receiver = null;
      const userReceiver = await db.User.findByPk(chatRequest.receiverId, { attributes: ['id', 'name', 'email'] });
      if (userReceiver) {
        receiver = { id: userReceiver.id, name: userReceiver.name, email: userReceiver.email, isAdmin: false };
      } else {
        const adminReceiver = await db.Admin.findByPk(chatRequest.receiverId, { attributes: ['id', 'name', 'email', 'role'] });
        if (adminReceiver) {
          receiver = { id: adminReceiver.id, name: adminReceiver.name, email: adminReceiver.email, isAdmin: true, role: adminReceiver.role };
        }
      }
      
      // Notify requester
      io.to(`user_${chatRequest.requesterId}`).emit('chat_request_responded', {
        requestId,
        status,
        receiver: receiver || { id: chatRequest.receiverId, name: 'Unknown User', email: 'No email', isAdmin: false }
      });
      
      // If accepted, create chat and add participants
      if (status === 'accepted') {
        const chat = await db.Chat.create({
          createdBy: chatRequest.requesterId
        });
        
        await db.ChatParticipant.bulkCreate([
          { chatId: chat.id, userId: chatRequest.requesterId },
          { chatId: chat.id, userId: chatRequest.receiverId }
        ]);
        
        // Notify both users about new chat
        io.to(`user_${chatRequest.requesterId}`).emit('chat_created', chat);
        io.to(`user_${chatRequest.receiverId}`).emit('chat_created', chat);
      }
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to respond to chat request' });
      console.error('Error responding to chat request:', error);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    updateOnlineStatus(socket.userId, 'offline');
  });
});

// Helper function to update online status
async function updateOnlineStatus(userId, status, socketId = null) {
  try {
    const [onlineStatus] = await db.OnlineStatus.findOrCreate({
      where: { userId },
      defaults: { userId, status, socketId }
    });
    
    await onlineStatus.update({
      status,
      lastSeen: new Date(),
      socketId
    });
    
    // Emit status update to all users who have chats with this user
    const userChats = await db.ChatParticipant.findAll({
      where: { userId },
      include: [{ model: db.Chat, as: 'chat' }]
    });
    
    userChats.forEach(async (participant) => {
      const otherParticipants = await db.ChatParticipant.findAll({
        where: { 
          chatId: participant.chatId,
          userId: { [db.Sequelize.Op.ne]: userId }
        }
      });
      
      otherParticipants.forEach((otherParticipant) => {
        io.to(`user_${otherParticipant.userId}`).emit('user_status_changed', {
          userId,
          status,
          lastSeen: onlineStatus.lastSeen
        });
      });
    });
    
  } catch (error) {
    console.error('Error updating online status:', error);
  }
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

