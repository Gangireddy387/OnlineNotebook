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
    state.messages.push(message);
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
    if (!token) return;

    const socket = io(process.env.VUE_APP_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      commit('SET_CONNECTION_STATUS', true);
      console.log('Connected to chat server');
    });

    socket.on('disconnect', () => {
      commit('SET_CONNECTION_STATUS', false);
      console.log('Disconnected from chat server');
    });

    socket.on('new_message', (message) => {
      // Only add message to current chat if it matches the current chat ID
      if (state.currentChat && message.chatId === state.currentChat.id) {
        commit('ADD_MESSAGE', message);
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
      const response = await axios.get('/chat');
      commit('SET_CHATS', response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  },

  // Fetch messages for a chat
  async fetchMessages({ commit }, { chatId, page = 1 }) {
    try {
      const response = await axios.get(`/chat/${chatId}/messages?page=${page}&limit=50`);
      commit('SET_MESSAGES', response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  // Send message
  async sendMessage({ state, commit }, { chatId, content, type = 'text', replyTo = null }) {
    if (!state.socket) return;

    state.socket.emit('send_message', {
      chatId,
      content,
      type,
      replyTo
    });
  },

  // Join chat room
  joinChat({ state }, chatId) {
    if (state.socket) {
      state.socket.emit('join_chat', chatId);
    }
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
