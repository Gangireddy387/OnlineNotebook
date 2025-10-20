import axios from '../../api/axios';
import { io } from 'socket.io-client';

const state = {
  socket: null,
  isConnected: false,
  chats: [],
  currentChat: null,
  messages: [],
  chatRequests: {
    sent: [],
    received: []
  },
  onlineUsers: new Map(),
  typingUsers: new Map(),
  searchResults: []
};

const mutations = {
  SET_SOCKET(state, socket) {
    state.socket = socket;
  },
  SET_CONNECTION_STATUS(state, status) {
    state.isConnected = status;
  },
  SET_CHATS(state, chats) {
    state.chats = chats;
  },
  SET_CURRENT_CHAT(state, chat) {
    state.currentChat = chat;
  },
  SET_MESSAGES(state, messages) {
    state.messages = messages;
  },
  ADD_MESSAGE(state, message) {
    console.log('ADD_MESSAGE mutation called with:', message);
    console.log('Current messages before push:', state.messages.length);
    state.messages.push(message);
    console.log('Messages array after push:', state.messages.length);
    console.log('All messages:', state.messages);
  },
  REPLACE_MESSAGE(state, { index, message }) {
    state.messages.splice(index, 1, message);
  },
  REMOVE_LAST_MESSAGE(state) {
    if (state.messages.length > 0) {
      state.messages.pop();
    }
  },
  REMOVE_MESSAGE_BY_ID(state, messageId) {
    const index = state.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      state.messages.splice(index, 1);
    }
  },
  REMOVE_MESSAGE_BY_INDEX(state, index) {
    if (index >= 0 && index < state.messages.length) {
      state.messages.splice(index, 1);
    }
  },
  SET_CHAT_REQUESTS(state, requests) {
    state.chatRequests = requests;
  },
  ADD_CHAT_REQUEST(state, request) {
    if (request.type === 'sent') {
      state.chatRequests.sent.push(request);
    } else {
      state.chatRequests.received.push(request);
    }
  },
  UPDATE_CHAT_REQUEST(state, { requestId, status }) {
    console.log('=== UPDATE_CHAT_REQUEST ===');
    console.log('Request ID:', requestId);
    console.log('Status:', status);
    console.log('Current received requests:', state.chatRequests.received.map(r => ({ id: r.id, status: r.status })));
    
    const sentIndex = state.chatRequests.sent.findIndex(r => r.id === requestId);
    const receivedIndex = state.chatRequests.received.findIndex(r => r.id === requestId);
    
    console.log('Sent index:', sentIndex);
    console.log('Received index:', receivedIndex);
    
    if (sentIndex !== -1) {
      state.chatRequests.sent[sentIndex].status = status;
      console.log('Updated sent request status');
    }
    if (receivedIndex !== -1) {
      state.chatRequests.received[receivedIndex].status = status;
      console.log('Updated received request status');
    }
    
    console.log('After update received requests:', state.chatRequests.received.map(r => ({ id: r.id, status: r.status })));
    console.log('=== END UPDATE_CHAT_REQUEST ===');
  },
  SET_ONLINE_STATUS(state, { userId, status, lastSeen }) {
    state.onlineUsers.set(userId, { status, lastSeen });
  },
  SET_TYPING_STATUS(state, { userId, chatId, isTyping }) {
    const key = `${userId}-${chatId}`;
    if (isTyping) {
      state.typingUsers.set(key, { userId, chatId, isTyping });
    } else {
      state.typingUsers.delete(key);
    }
  },
  SET_SEARCH_RESULTS(state, results) {
    state.searchResults = results;
  },
  ADD_CHAT(state, chat) {
    const existingIndex = state.chats.findIndex(c => c.id === chat.id);
    if (existingIndex === -1) {
      state.chats.unshift(chat);
    }
  },
  UPDATE_CHAT_LAST_MESSAGE(state, { chatId, message }) {
    const chat = state.chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessageAt = message.createdAt;
      chat.messages = [message];
      // Move chat to top
      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex > 0) {
        state.chats.splice(chatIndex, 1);
        state.chats.unshift(chat);
      }
    }
  }
};

const actions = {
  // Initialize socket connection
  async initializeSocket({ commit, rootState }) {
    const token = localStorage.getItem('token');
    console.log('Initializing socket with token:', !!token);
    
    if (!token) {
      console.error('No token found for socket connection');
      return;
    }

    const socketUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
    console.log('Connecting to socket:', socketUrl);
    
    const socket = io(socketUrl, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('=== SOCKET CONNECTED ===');
      console.log('Socket ID:', socket.id);
      console.log('Connection status set to true');
      commit('SET_CONNECTION_STATUS', true);
      console.log('=== SOCKET CONNECTED END ===');
    });

    socket.on('disconnect', () => {
      console.log('=== SOCKET DISCONNECTED ===');
      console.log('Connection status set to false');
      commit('SET_CONNECTION_STATUS', false);
      console.log('=== SOCKET DISCONNECTED END ===');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      // Handle message sending errors
      if (error.message && error.message.includes('send')) {
        // Remove the last optimistic message if it exists
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && lastMessage.isOptimistic) {
          commit('REMOVE_LAST_MESSAGE');
        }
      }
    });

    socket.on('new_message', (message) => {
      console.log('New message received:', message);
      console.log('Current chat ID:', state.currentChat?.id);
      console.log('Message chat ID:', message.chatId);
      
      // Only add message to current chat if it matches the current chat ID
      if (state.currentChat && message.chatId === state.currentChat.id) {
        console.log('Adding message to current chat');
        
        // Check if this message replaces an optimistic message
        console.log('Looking for optimistic message to replace...');
        console.log('Current messages:', state.messages.map(m => ({ id: m.id, content: m.content, isOptimistic: m.isOptimistic, senderId: m.senderId })));
        console.log('Incoming message:', { id: message.id, content: message.content, senderId: message.senderId });
        
        // Remove all optimistic messages from the same sender
        const optimisticMessages = state.messages.filter(m => m.isOptimistic && m.senderId === message.senderId);
        console.log('Optimistic messages from sender:', optimisticMessages);
        
        if (optimisticMessages.length > 0) {
          // Remove all optimistic messages from this sender
          for (let i = state.messages.length - 1; i >= 0; i--) {
            if (state.messages[i].isOptimistic && state.messages[i].senderId === message.senderId) {
              console.log('Removing optimistic message at index:', i);
              commit('REMOVE_MESSAGE_BY_INDEX', i);
            }
          }
        }
        
        // Add the real message
        commit('ADD_MESSAGE', message);
        console.log('Added real message');
      }
      // Update the chat list with the last message
      commit('UPDATE_CHAT_LAST_MESSAGE', { chatId: message.chatId, message });
    });

    socket.on('user_typing', (data) => {
      commit('SET_TYPING_STATUS', { ...data, chatId: data.chatId });
    });

    socket.on('user_status_changed', (data) => {
      commit('SET_ONLINE_STATUS', data);
    });

    socket.on('chat_request_received', (request) => {
      commit('ADD_CHAT_REQUEST', { ...request, type: 'received' });
    });

    socket.on('chat_request_responded', (data) => {
      commit('UPDATE_CHAT_REQUEST', data);
      if (data.status === 'accepted' && data.chat) {
        commit('ADD_CHAT', data.chat);
      }
    });

    socket.on('chat_created', (chat) => {
      commit('ADD_CHAT', chat);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    commit('SET_SOCKET', socket);
  },

  // Disconnect socket
  disconnectSocket({ commit, state }) {
    if (state.socket) {
      state.socket.disconnect();
      commit('SET_SOCKET', null);
      commit('SET_CONNECTION_STATUS', false);
    }
  },

  // Fetch user's chats
  async fetchChats({ commit }) {
    try {
      console.log('Fetching chats...');
      const response = await axios.get('/chat');
      console.log('Chats fetched:', response.data.length, 'chats');
      console.log('Chats data:', response.data);
      commit('SET_CHATS', response.data);
      
      // Return the chats data so the component can use it
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  // Fetch messages for a chat
  async fetchMessages({ commit }, { chatId, page = 1 }) {
    try {
      console.log('Fetching messages for chat:', chatId);
      const response = await axios.get(`/chat/${chatId}/messages?page=${page}&limit=50`);
      console.log('Messages fetched:', response.data.length, 'messages');
      commit('SET_MESSAGES', response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  // Send message
  async sendMessage({ state, commit, rootState }, { chatId, content, type = 'text', replyTo = null }) {
    console.log('Sending message:', { chatId, content, type, replyTo });
    console.log('Socket available:', !!state.socket);
    
    if (!state.socket) {
      console.error('No socket connection available');
      return;
    }

    // Optimistic message is now created in the component
    console.log('Sending message via socket - optimistic message should already be added');

    // Send via socket
    state.socket.emit('send_message', {
      chatId,
      content,
      type,
      replyTo
    });
    
    console.log('Message sent via socket');
  },

  // Join chat room
  joinChat({ state }, chatId) {
    console.log('=== JOIN CHAT DEBUG ===');
    console.log('Socket available:', !!state.socket);
    console.log('Socket connected:', state.isConnected);
    console.log('Chat ID to join:', chatId);
    
    if (state.socket) {
      console.log('Emitting join_chat event...');
      state.socket.emit('join_chat', chatId);
      console.log('join_chat event emitted');
    } else {
      console.error('No socket available for joining chat');
    }
    console.log('=== JOIN CHAT DEBUG END ===');
  },

  // Leave chat room
  leaveChat({ state }, chatId) {
    if (state.socket) {
      state.socket.emit('leave_chat', chatId);
    }
  },

  // Send typing indicator
  sendTyping({ state }, { chatId, isTyping }) {
    if (state.socket) {
      state.socket.emit('typing', { chatId, isTyping });
    }
  },

  // Mark messages as read
  markMessagesAsRead({ state }, chatId) {
    if (state.socket) {
      state.socket.emit('mark_read', { chatId });
    }
  },

  // Search users for chat requests
    async searchUsers({ commit }, query) {
      try {
        const response = await axios.get(`/chat/users/search?q=${encodeURIComponent(query)}`);
        commit('SET_SEARCH_RESULTS', response.data);
        return response.data;
      } catch (error) {
        console.error('Error searching users:', error);
        throw error;
      }
    },

  // Send chat request
  async sendChatRequest({ commit }, { receiverId, message }) {
    try {
      const response = await axios.post('/chat/request', { receiverId, message });
      commit('ADD_CHAT_REQUEST', { ...response.data, type: 'sent' });
      return response.data;
    } catch (error) {
      console.error('Error sending chat request:', error);
      throw error;
    }
  },

  // Fetch chat requests
  async fetchChatRequests({ commit }) {
    try {
      const response = await axios.get('/chat/requests/all');
      commit('SET_CHAT_REQUESTS', response.data);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
    }
  },

  // Respond to chat request
  async respondToChatRequest({ commit, state }, { requestId, status }) {
    try {
      const response = await axios.put(`/chat/request/${requestId}/respond`, { status });
      commit('UPDATE_CHAT_REQUEST', { requestId, status });
      
      if (state.socket) {
        state.socket.emit('respond_chat_request', { requestId, status });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error responding to chat request:', error);
      throw error;
    }
  },

  // Admin: Fetch all chats
  async fetchAllChats({ commit }) {
    try {
      const response = await axios.get('/chat/admin/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all chats:', error);
      throw error;
    }
  },

  // Admin: Fetch all messages for a chat
  async fetchAllMessages({ commit }, chatId) {
    try {
      const response = await axios.get(`/chat/admin/${chatId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all messages:', error);
      throw error;
    }
  }
};

const getters = {
  getChatById: (state) => (id) => {
    return state.chats.find(chat => chat.id === id);
  },
  getOnlineStatus: (state) => (userId) => {
    return state.onlineUsers.get(userId) || { status: 'offline' };
  },
  getTypingUsers: (state) => (chatId) => {
    const typingUsers = [];
    state.typingUsers.forEach((value, key) => {
      if (value.chatId === chatId && value.isTyping) {
        typingUsers.push(value.userId);
      }
    });
    return typingUsers;
  },
  unreadChatRequests: (state) => {
    return state.chatRequests.received.filter(req => req.status === 'pending');
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
