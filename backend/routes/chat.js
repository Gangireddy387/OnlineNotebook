const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect } = require('../middleware/auth');

// Get all chats for a user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.userType;
    
    
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
              order: [['createdAt', 'DESC']],
              limit: 1
            },
            {
              model: db.ChatParticipant,
              as: 'participants'
            }
          ]
        }
      ],
      order: [[{ model: db.Chat, as: 'chat' }, 'lastMessageAt', 'DESC']]
    });
    
    // Process chats to include admin participants
    const processedChats = await Promise.all(
      chats.map(async (participant) => {
        const chat = participant.chat;
        
        // Get all participants with their details (both users and admins)
        const allParticipants = await Promise.all(
          chat.participants.map(async (p) => {
            let userDetails = null;
            
            // Try to find in Users table first
            const user = await db.User.findByPk(p.userId, {
              attributes: ['id', 'name', 'email'],
              include: [{ model: db.OnlineStatus, as: 'onlineStatus', attributes: ['status', 'lastSeen'] }]
            });
            
            if (user) {
              userDetails = {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: false,
                onlineStatus: user.onlineStatus
              };
            } else {
              // If not found in Users, try Admins table
              const adminDetails = await db.Admin.findByPk(p.userId, {
                attributes: ['id', 'name', 'email', 'role']
              });
              if (adminDetails) {
                userDetails = {
                  id: adminDetails.id,
                  name: adminDetails.name,
                  email: adminDetails.email,
                  isAdmin: true,
                  role: adminDetails.role,
                  onlineStatus: null
                };
              }
            }
            
            return {
              ...p.toJSON(),
              user: userDetails || { id: p.userId, name: 'Unknown User', email: 'No email', isAdmin: false }
            };
          })
        );
        
        return {
          ...chat.toJSON(),
          participants: allParticipants
        };
      })
    );
    
    res.json(processedChats);
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
        { 
          model: db.Message, 
          as: 'replyToMessage'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Process messages to include admin senders
    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        let sender = null;
        
        // Try to find sender in Users table first
        const userSender = await db.User.findByPk(message.senderId, {
          attributes: ['id', 'name', 'email']
        });
        
        if (userSender) {
          sender = {
            id: userSender.id,
            name: userSender.name,
            email: userSender.email,
            isAdmin: false
          };
        } else {
          // If not found in Users, try Admins table
          const adminSender = await db.Admin.findByPk(message.senderId, {
            attributes: ['id', 'name', 'email', 'role']
          });
          if (adminSender) {
            sender = {
              id: adminSender.id,
              name: adminSender.name,
              email: adminSender.email,
              isAdmin: true,
              role: adminSender.role
            };
          }
        }
        
        return {
          ...message.toJSON(),
          sender: sender || { id: message.senderId, name: 'Unknown User', email: 'No email', isAdmin: false }
        };
      })
    );
    
    res.json(processedMessages.reverse()); // Reverse to show oldest first
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
      where: { chatId }
    });
    
    // Process participants to include admin users
    const processedParticipants = await Promise.all(
      participants.map(async (participant) => {
        let userDetails = null;
        
        // Try to find in Users table first
        const user = await db.User.findByPk(participant.userId, {
          attributes: ['id', 'name', 'email'],
          include: [{ model: db.OnlineStatus, as: 'onlineStatus', attributes: ['status', 'lastSeen'] }]
        });
        
        if (user) {
          userDetails = {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: false,
            onlineStatus: user.onlineStatus
          };
        } else {
          // If not found in Users, try Admins table
          const adminDetails = await db.Admin.findByPk(participant.userId, {
            attributes: ['id', 'name', 'email', 'role']
          });
          if (adminDetails) {
            userDetails = {
              id: adminDetails.id,
              name: adminDetails.name,
              email: adminDetails.email,
              isAdmin: true,
              role: adminDetails.role,
              onlineStatus: null // Admins don't have online status in the same way
            };
          }
        }
        
        return {
          ...participant.toJSON(),
          user: userDetails || { id: participant.userId, name: 'Unknown User', email: 'No email', isAdmin: false }
        };
      })
    );
    
    res.json(processedParticipants);
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
    
    // Search both regular users and admins
    const [users, admins] = await Promise.all([
      // Search regular users
      db.User.findAll({
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
        limit: 10
      }),
      // Search admins (only if current user is not an admin or if searching for other admins)
      req.userType === 'admin' ? 
        db.Admin.findAll({
          where: {
            id: { [db.Sequelize.Op.ne]: userId },
            isActive: true,
            [db.Sequelize.Op.or]: [
              { name: { [db.Sequelize.Op.iLike]: `%${q}%` } },
              { email: { [db.Sequelize.Op.iLike]: `%${q}%` } }
            ]
          },
          attributes: ['id', 'name', 'email', 'role', 'adminId'],
          limit: 10
        }) : []
    ]);
    
    // Format admins to match user structure
    const formattedAdmins = admins.map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      year: null,
      rollNumber: admin.adminId,
      college: null,
      department: null,
      onlineStatus: null,
      isAdmin: true,
      role: admin.role
    }));
    
    // Combine and limit results
    const allResults = [...users, ...formattedAdmins];
    res.json(allResults.slice(0, 20));
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
    const requesterType = req.userType; // 'user' or 'admin'
    
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
    
    // Check if chat already exists between these users
    // We need to check both User and Admin tables for participants
    let existingChat = null;
    
    if (requesterType === 'admin') {
      // If requester is admin, check if they have a chat with the receiver
      const requesterParticipant = await db.ChatParticipant.findOne({
        where: { userId: requesterId },
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
      
      if (requesterParticipant) {
        existingChat = requesterParticipant.chat;
      }
    } else {
      // If requester is regular user, check if they have a chat with the receiver
      const requesterParticipant = await db.ChatParticipant.findOne({
        where: { userId: requesterId },
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
      
      if (requesterParticipant) {
        existingChat = requesterParticipant.chat;
      }
    }
    
    if (existingChat) {
      return res.status(400).json({ message: 'Chat already exists' });
    }
    
    const chatRequest = await db.ChatRequest.create({
      requesterId,
      receiverId,
      message
    });
    
    // Get the request with requester details
    let requestWithRequester;
    if (requesterType === 'admin') {
      const admin = await db.Admin.findByPk(requesterId, {
        attributes: ['id', 'name', 'email']
      });
      requestWithRequester = {
        ...chatRequest.toJSON(),
        requester: admin || { id: requesterId, name: 'Unknown Admin', email: 'No email' }
      };
    } else {
      const user = await db.User.findByPk(requesterId, {
        attributes: ['id', 'name', 'email']
      });
      requestWithRequester = {
        ...chatRequest.toJSON(),
        requester: user || { id: requesterId, name: 'Unknown User', email: 'No email' }
      };
    }
    
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
    const userType = req.userType;
    
    const [sentRequests, receivedRequests] = await Promise.all([
      db.ChatRequest.findAll({
        where: { requesterId: userId },
        order: [['createdAt', 'DESC']]
      }),
      db.ChatRequest.findAll({
        where: { receiverId: userId },
        order: [['createdAt', 'DESC']]
      })
    ]);
    
    // Get requester and receiver details for each request
    const processedSentRequests = await Promise.all(
      sentRequests.map(async (request) => {
        let receiver;
        if (userType === 'admin') {
          // If current user is admin, receiver could be user or admin
          receiver = await db.User.findByPk(request.receiverId, {
            attributes: ['id', 'name', 'email']
          });
          if (!receiver) {
            receiver = await db.Admin.findByPk(request.receiverId, {
              attributes: ['id', 'name', 'email']
            });
          }
        } else {
          // If current user is regular user, receiver could be user or admin
          receiver = await db.User.findByPk(request.receiverId, {
            attributes: ['id', 'name', 'email']
          });
          if (!receiver) {
            receiver = await db.Admin.findByPk(request.receiverId, {
              attributes: ['id', 'name', 'email']
            });
          }
        }
        
        return {
          ...request.toJSON(),
          receiver: receiver || { id: request.receiverId, name: 'Unknown User', email: 'No email' }
        };
      })
    );
    
    const processedReceivedRequests = await Promise.all(
      receivedRequests.map(async (request) => {
        let requester;
        if (userType === 'admin') {
          // If current user is admin, requester could be user or admin
          requester = await db.User.findByPk(request.requesterId, {
            attributes: ['id', 'name', 'email']
          });
          if (!requester) {
            requester = await db.Admin.findByPk(request.requesterId, {
              attributes: ['id', 'name', 'email']
            });
          }
        } else {
          // If current user is regular user, requester could be user or admin
          requester = await db.User.findByPk(request.requesterId, {
            attributes: ['id', 'name', 'email']
          });
          if (!requester) {
            requester = await db.Admin.findByPk(request.requesterId, {
              attributes: ['id', 'name', 'email']
            });
          }
        }
        
        return {
          ...request.toJSON(),
          requester: requester || { id: request.requesterId, name: 'Unknown User', email: 'No email' }
        };
      })
    );
    
    res.json({
      sent: processedSentRequests,
      received: processedReceivedRequests
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
    const userType = req.userType;
    
    const chatRequest = await db.ChatRequest.findByPk(requestId);
    
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
      
      // Get requester details for response
      let requester;
      if (userType === 'admin') {
        requester = await db.User.findByPk(chatRequest.requesterId, {
          attributes: ['id', 'name', 'email']
        });
        if (!requester) {
          requester = await db.Admin.findByPk(chatRequest.requesterId, {
            attributes: ['id', 'name', 'email']
          });
        }
      } else {
        requester = await db.User.findByPk(chatRequest.requesterId, {
          attributes: ['id', 'name', 'email']
        });
        if (!requester) {
          requester = await db.Admin.findByPk(chatRequest.requesterId, {
            attributes: ['id', 'name', 'email']
          });
        }
      }
      
      res.json({ 
        chatRequest: {
          ...chatRequest.toJSON(),
          requester: requester || { id: chatRequest.requesterId, name: 'Unknown User', email: 'No email' }
        }, 
        chat 
      });
    } else {
      // Get requester details for response
      let requester;
      if (userType === 'admin') {
        requester = await db.User.findByPk(chatRequest.requesterId, {
          attributes: ['id', 'name', 'email']
        });
        if (!requester) {
          requester = await db.Admin.findByPk(chatRequest.requesterId, {
            attributes: ['id', 'name', 'email']
          });
        }
      } else {
        requester = await db.User.findByPk(chatRequest.requesterId, {
          attributes: ['id', 'name', 'email']
        });
        if (!requester) {
          requester = await db.Admin.findByPk(chatRequest.requesterId, {
            attributes: ['id', 'name', 'email']
          });
        }
      }
      
      res.json({ 
        chatRequest: {
          ...chatRequest.toJSON(),
          requester: requester || { id: chatRequest.requesterId, name: 'Unknown User', email: 'No email' }
        }
      });
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
    // Check if user is admin or super_admin
    if (req.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied - admin access required' });
    }

    // Additional check for super_admin role
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Access denied - insufficient permissions' });
    }
    
    const chats = await db.Chat.findAll({
      include: [
        {
          model: db.Message,
          as: 'messages',
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
    
    // Deduplicate conversations by participant pairs
    const deduplicatedChats = deduplicateConversations(chats);
    
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
        { 
          model: db.Message, 
          as: 'replyToMessage'
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // Process messages to include admin senders
    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        let sender = null;
        
        // Try to find sender in Users table first
        const userSender = await db.User.findByPk(message.senderId, {
          attributes: ['id', 'name', 'email']
        });
        
        if (userSender) {
          sender = {
            id: userSender.id,
            name: userSender.name,
            email: userSender.email,
            isAdmin: false
          };
        } else {
          // If not found in Users, try Admins table
          const adminSender = await db.Admin.findByPk(message.senderId, {
            attributes: ['id', 'name', 'email', 'role']
          });
          if (adminSender) {
            sender = {
              id: adminSender.id,
              name: adminSender.name,
              email: adminSender.email,
              isAdmin: true,
              role: adminSender.role
            };
          }
        }
        
        // Process replyToMessage sender if it exists
        let replyToMessage = message.replyToMessage;
        if (replyToMessage) {
          let replySender = null;
          
          // Try to find reply sender in Users table first
          const userReplySender = await db.User.findByPk(replyToMessage.senderId, {
            attributes: ['id', 'name']
          });
          
          if (userReplySender) {
            replySender = {
              id: userReplySender.id,
              name: userReplySender.name,
              isAdmin: false
            };
          } else {
            // If not found in Users, try Admins table
            const adminReplySender = await db.Admin.findByPk(replyToMessage.senderId, {
              attributes: ['id', 'name']
            });
            if (adminReplySender) {
              replySender = {
                id: adminReplySender.id,
                name: adminReplySender.name,
                isAdmin: true
              };
            }
          }
          
          replyToMessage = {
            ...replyToMessage.toJSON(),
            sender: replySender || { id: replyToMessage.senderId, name: 'Unknown User', isAdmin: false }
          };
        }
        
        return {
          ...message.toJSON(),
          sender: sender || { id: message.senderId, name: 'Unknown User', email: 'No email', isAdmin: false },
          replyToMessage
        };
      })
    );
    
    res.json(processedMessages);
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
