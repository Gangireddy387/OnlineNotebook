const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect } = require('../middleware/auth');

// Get all chats for a user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await db.ChatParticipant.findAll({
      where: { userId },
      include: [
        {
          model: db.Chat,
          as: 'chat',
          include: [
            {
              model: db.Message,
              as: 'messages',
              include: [{ model: db.User, as: 'sender', attributes: ['id', 'name'] }],
              order: [['createdAt', 'DESC']],
              limit: 1
            },
            {
              model: db.ChatParticipant,
              as: 'participants',
              include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email'] }]
            }
          ]
        }
      ],
      order: [[{ model: db.Chat, as: 'chat' }, 'lastMessageAt', 'DESC']]
    });
    
    res.json(chats.map(participant => participant.chat));
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    
    // Check if user is participant of this chat
    const participant = await db.ChatParticipant.findOne({
      where: { chatId, userId }
    });
    
    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const offset = (page - 1) * limit;
    
    const messages = await db.Message.findAll({
      where: { chatId },
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { 
          model: db.Message, 
          as: 'replyToMessage', 
          include: [{ model: db.User, as: 'sender', attributes: ['id', 'name'] }] 
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat participants
router.get('/:chatId/participants', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Check if user is participant of this chat
    const participant = await db.ChatParticipant.findOne({
      where: { chatId, userId }
    });
    
    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const participants = await db.ChatParticipant.findAll({
      where: { chatId },
      include: [
        { 
          model: db.User, 
          as: 'user', 
          attributes: ['id', 'name', 'email'],
          include: [{ model: db.OnlineStatus, as: 'onlineStatus' }]
        }
      ]
    });
    
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users for chat requests
router.get('/users/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const users = await db.User.findAll({
      where: {
        id: { [db.Sequelize.Op.ne]: userId },
        isApproved: true,
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.iLike]: `%${q}%` } },
          { email: { [db.Sequelize.Op.iLike]: `%${q}%` } }
        ]
      },
      include: [
        { model: db.College, as: 'college', attributes: ['name'] },
        { model: db.Department, as: 'department', attributes: ['name'] },
        { model: db.OnlineStatus, as: 'onlineStatus' }
      ],
      attributes: ['id', 'name', 'email', 'year', 'rollNumber'],
      limit: 20
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send chat request
router.post('/request', protect, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const requesterId = req.user.id;
    
    if (requesterId === receiverId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }
    
    // Check if request already exists
    const existingRequest = await db.ChatRequest.findOne({
      where: {
        requesterId,
        receiverId,
        status: 'pending'
      }
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }
    
    // Check if chat already exists
    const existingChat = await db.ChatParticipant.findOne({
      where: {
        userId: requesterId
      },
      include: [{
        model: db.Chat,
        as: 'chat',
        include: [{
          model: db.ChatParticipant,
          as: 'participants',
          where: { userId: receiverId }
        }]
      }]
    });
    
    if (existingChat) {
      return res.status(400).json({ message: 'Chat already exists' });
    }
    
    const chatRequest = await db.ChatRequest.create({
      requesterId,
      receiverId,
      message
    });
    
    const requestWithRequester = await db.ChatRequest.findByPk(chatRequest.id, {
      include: [{ model: db.User, as: 'requester', attributes: ['id', 'name', 'email'] }]
    });
    
    res.json(requestWithRequester);
  } catch (error) {
    console.error('Error sending chat request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat requests (sent and received)
router.get('/requests/all', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [sentRequests, receivedRequests] = await Promise.all([
      db.ChatRequest.findAll({
        where: { requesterId: userId },
        include: [{ model: db.User, as: 'receiver', attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']]
      }),
      db.ChatRequest.findAll({
        where: { receiverId: userId },
        include: [{ model: db.User, as: 'requester', attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']]
      })
    ]);
    
    res.json({
      sent: sentRequests,
      received: receivedRequests
    });
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to chat request
router.put('/request/:requestId/respond', protect, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    const chatRequest = await db.ChatRequest.findByPk(requestId, {
      include: ['requester', 'receiver']
    });
    
    if (!chatRequest) {
      return res.status(404).json({ message: 'Chat request not found' });
    }
    
    if (chatRequest.receiverId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (chatRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already responded' });
    }
    
    await chatRequest.update({
      status,
      respondedAt: new Date()
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
      
      res.json({ chatRequest, chat });
    } else {
      res.json({ chatRequest });
    }
  } catch (error) {
    console.error('Error responding to chat request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Function to deduplicate conversations by participant pairs
function deduplicateConversations(chats) {
  const chatMap = new Map();
  
  chats.forEach(chat => {
    if (!chat.participants || chat.participants.length === 0) return;
    
    // Create a unique key for participant pairs (sorted by user ID)
    const participantIds = chat.participants
      .map(p => p.user.id)
      .sort((a, b) => a - b);
    
    const key = participantIds.join('-');
    
    if (chatMap.has(key)) {
      // Merge with existing chat
      const existingChat = chatMap.get(key);
      
      // Keep the chat with more recent activity
      const existingLastMessage = existingChat.lastMessageAt ? new Date(existingChat.lastMessageAt) : null;
      const currentLastMessage = chat.lastMessageAt ? new Date(chat.lastMessageAt) : null;
      
      if (currentLastMessage && (!existingLastMessage || currentLastMessage > existingLastMessage)) {
        // Current chat is more recent, replace existing
        chatMap.set(key, chat);
      }
      // Otherwise keep existing chat
    } else {
      // First chat with this participant pair
      chatMap.set(key, chat);
    }
  });
  
  return Array.from(chatMap.values());
}

// Admin route - Get all chats (for monitoring)
router.get('/admin/all', protect, async (req, res) => {
  try {
    console.log('Admin route: User type:', req.userType);
    console.log('Admin route: User role:', req.user.role);
    console.log('Admin route: User ID:', req.user.id);
    
    // Check if user is admin or super_admin
    if (req.userType !== 'admin') {
      console.log('Admin route: Access denied - not admin user type');
      return res.status(403).json({ message: 'Access denied - admin access required' });
    }
    
    // Additional check for super_admin role
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'moderator') {
      console.log('Admin route: Access denied - insufficient role:', req.user.role);
      return res.status(403).json({ message: 'Access denied - insufficient permissions' });
    }
    
    console.log('Admin route: Fetching chats from database...');
    const chats = await db.Chat.findAll({
      include: [
        {
          model: db.Message,
          as: 'messages',
          include: [{ model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] }],
          order: [['createdAt', 'DESC']],
          limit: 1,
          required: true, // INNER JOIN - only include chats that have actual messages
          where: {
            type: {
              [db.Sequelize.Op.ne]: 'system' // Exclude system messages (like request messages)
            }
          }
        },
        {
          model: db.ChatParticipant,
          as: 'participants',
          include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email'] }],
          required: true // INNER JOIN to ensure we have participants
        }
      ],
      where: {
        lastMessageAt: {
          [db.Sequelize.Op.ne]: null // Only show chats that have had messages
        }
      },
      order: [
        ['lastMessageAt', 'DESC'], // Order by most recent message activity
        ['createdAt', 'DESC']
      ]
    });
    
    console.log('Admin route: Found chats:', chats.length);
    
    // Deduplicate conversations by participant pairs
    const deduplicatedChats = deduplicateConversations(chats);
    console.log('Admin route: Deduplicated chats:', deduplicatedChats.length);
    
    res.json(deduplicatedChats);
  } catch (error) {
    console.error('Admin route: Error fetching all chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route - Get all messages for a specific chat
router.get('/admin/:chatId/messages', protect, async (req, res) => {
  try {
    // Check if user is admin or super_admin
    if (req.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied - admin access required' });
    }
    
    // Additional check for super_admin role
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Access denied - insufficient permissions' });
    }
    
    const { chatId } = req.params;
    
    const messages = await db.Message.findAll({
      where: { chatId },
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { 
          model: db.Message, 
          as: 'replyToMessage', 
          include: [{ model: db.User, as: 'sender', attributes: ['id', 'name'] }] 
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route - Delete a message
router.delete('/admin/message/:messageId', protect, async (req, res) => {
  try {
    // Check if user is admin or super_admin
    if (req.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied - admin access required' });
    }
    
    // Additional check for super_admin role
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Access denied - insufficient permissions' });
    }
    
    const { messageId } = req.params;
    
    const message = await db.Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.destroy();
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
