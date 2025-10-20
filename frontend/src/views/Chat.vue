<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <div 
      class="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 bg-white border-r border-gray-200 flex flex-col md:flex md:flex-col"
      :class="{
        'fixed inset-0 z-50 md:relative md:inset-auto': showSidebar,
        'hidden md:flex': !showSidebar
      }"
    >
      <!-- Header -->
      <div class="p-3 md:p-4 border-b border-gray-200 bg-green-500 text-white">
        <div class="flex items-center justify-between">
          <h2 class="text-lg md:text-xl font-semibold">Users</h2>
          <div class="flex space-x-1 md:space-x-2">
            <!-- Mobile close button -->
            <button 
              @click="showSidebar = false"
              class="md:hidden p-1.5 rounded-full hover:bg-green-600 transition-colors"
              title="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <button 
              @click="showNewChatModal = true"
              class="p-1.5 md:p-2 rounded-full hover:bg-green-600 transition-colors"
              title="New Chat"
            >
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
            <button 
              @click="refreshUsers"
              class="p-1.5 md:p-2 rounded-full hover:bg-green-600 transition-colors"
              title="Refresh Users"
            >
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Requests Button -->
      <div class="p-2 md:p-4 border-b border-gray-200">
        <button 
          @click="showChatRequests = true"
          class="w-full flex items-center justify-between p-2 md:p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <div class="flex items-center space-x-2 md:space-x-3">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="font-medium text-blue-900 text-sm md:text-base">Chat Requests</span>
          </div>
          <div v-if="unreadChatRequests.length > 0" class="bg-red-500 text-white text-xs rounded-full px-1.5 md:px-2 py-1">
            {{ unreadChatRequests.length }}
          </div>
        </button>
      </div>

      <!-- User List -->
      <div class="flex-1 overflow-y-auto">
        <!-- Search -->
        <div class="p-2 md:p-4 border-b border-gray-200">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loadingUsers" class="p-4 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p class="text-gray-500 mt-2">Loading users...</p>
        </div>

        <!-- Users List -->
        <div v-else-if="filteredUsers.length === 0" class="p-4 text-center text-gray-500">
          <p>No users found</p>
        </div>
        
        <div v-else>
          <!-- Online Users -->
          <div v-if="onlineUsers.length > 0" class="p-2">
            <h3 class="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Online ({{ onlineUsers.length }})</h3>
            <div 
              v-for="user in onlineUsers" 
              :key="user.id"
              @click="selectUser(user)"
              class="p-2 md:p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              :class="{ 'bg-green-50 border-green-200': selectedUser?.id === user.id }"
            >
              <div class="flex items-center space-x-2 md:space-x-3">
                <div class="relative">
                  <div class="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white bg-green-500"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-900 truncate text-sm md:text-base">
                    {{ user.name }}
                    <span v-if="user.isAdmin" class="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                      {{ user.role }}
                    </span>
                  </h3>
                  <p class="text-xs md:text-sm text-gray-500 truncate">{{ user.email }}</p>
                  <p class="text-xs text-green-600">Online</p>
                </div>
                <div class="flex flex-col items-end hidden md:flex">
                  <span v-if="user.isAdmin" class="text-xs text-blue-600 font-medium">Admin</span>
                  <span v-else class="text-xs text-gray-400">{{ user.college?.name }}</span>
                  <span v-if="!user.isAdmin" class="text-xs text-gray-400">{{ user.department?.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Offline Users -->
          <div v-if="offlineUsers.length > 0" class="p-2">
            <h3 class="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Offline ({{ offlineUsers.length }})</h3>
            <div 
              v-for="user in offlineUsers" 
              :key="user.id"
              @click="selectUser(user)"
              class="p-2 md:p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors opacity-75"
              :class="{ 'bg-blue-50 border-blue-200': selectedUser?.id === user.id }"
            >
              <div class="flex items-center space-x-2 md:space-x-3">
                <div class="relative">
                  <div class="w-8 h-8 md:w-10 md:h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white bg-gray-400"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-900 truncate text-sm md:text-base">
                    {{ user.name }}
                    <span v-if="user.isAdmin" class="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                      {{ user.role }}
                    </span>
                  </h3>
                  <p class="text-xs md:text-sm text-gray-500 truncate">{{ user.email }}</p>
                  <p class="text-xs text-gray-500">Offline</p>
                </div>
                <div class="flex flex-col items-end hidden md:flex">
                  <span v-if="user.isAdmin" class="text-xs text-blue-600 font-medium">Admin</span>
                  <span v-else class="text-xs text-gray-400">{{ user.college?.name }}</span>
                  <span v-if="!user.isAdmin" class="text-xs text-gray-400">{{ user.department?.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Mobile Menu Toggle (hidden on desktop) -->
      <div class="md:hidden p-4 bg-white border-b border-gray-200">
        <button 
          @click="toggleSidebar"
          class="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          <span class="font-medium">Users</span>
        </button>
      </div>

      <div v-if="!currentChat" class="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div class="text-center">
          <svg class="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <h3 class="text-base md:text-lg font-medium text-gray-900 mb-2">Select a chat to start messaging</h3>
          <p class="text-sm md:text-base text-gray-500">Choose from your existing chats or start a new conversation</p>
        </div>
      </div>

      <!-- Chat Window -->
      <ChatWindow 
        v-else-if="currentChat"
        :chat="currentChat"
        :messages="messages"
        :online-status="getOnlineStatus"
        :typing-users="getTypingUsers"
        @send-message="sendMessage"
        @send-typing="sendTyping"
        @mark-read="markMessagesAsRead"
      />
      
      <!-- User Info Panel -->
      <div v-else-if="selectedUser" class="flex-1 flex flex-col bg-gray-50">
        <!-- User Header -->
        <div class="p-4 md:p-6 border-b border-gray-200 bg-white">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="relative">
              <div class="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-lg md:text-xl">
                {{ selectedUser.name.charAt(0).toUpperCase() }}
              </div>
              <div 
                class="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white"
                :class="getOnlineStatus(selectedUser.id).status === 'online' ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
            </div>
            <div>
              <h3 class="text-lg md:text-xl font-semibold text-gray-900">
                {{ selectedUser.name }}
                <span v-if="selectedUser.isAdmin" class="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {{ selectedUser.role }}
                </span>
              </h3>
              <p class="text-sm md:text-base text-gray-600">{{ selectedUser.email }}</p>
              <p class="text-xs md:text-sm" :class="getOnlineStatus(selectedUser.id).status === 'online' ? 'text-green-600' : 'text-gray-500'">
                {{ getOnlineStatus(selectedUser.id).status === 'online' ? 'Online' : 'Offline' }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- User Details -->
        <div class="p-4 md:p-6 space-y-4">
          <div class="bg-white rounded-lg p-3 md:p-4">
            <h4 class="font-semibold text-gray-900 mb-3 text-sm md:text-base">
              {{ selectedUser.isAdmin ? 'Admin Information' : 'User Information' }}
            </h4>
            <div class="space-y-2">
              <div v-if="selectedUser.isAdmin" class="flex justify-between text-sm md:text-base">
                <span class="text-gray-600">Role:</span>
                <span class="font-medium">{{ selectedUser.role }}</span>
              </div>
              <div v-if="selectedUser.isAdmin" class="flex justify-between text-sm md:text-base">
                <span class="text-gray-600">Admin ID:</span>
                <span class="font-medium">{{ selectedUser.rollNumber || 'N/A' }}</span>
              </div>
              <div v-if="!selectedUser.isAdmin" class="flex justify-between text-sm md:text-base">
                <span class="text-gray-600">College:</span>
                <span class="font-medium">{{ selectedUser.college?.name || 'N/A' }}</span>
              </div>
              <div v-if="!selectedUser.isAdmin" class="flex justify-between text-sm md:text-base">
                <span class="text-gray-600">Department:</span>
                <span class="font-medium">{{ selectedUser.department?.name || 'N/A' }}</span>
              </div>
              <div v-if="!selectedUser.isAdmin" class="flex justify-between text-sm md:text-base">
                <span class="text-gray-600">Year:</span>
                <span class="font-medium">{{ selectedUser.year || 'N/A' }}</span>
              </div>
              <div v-if="!selectedUser.isAdmin" class="flex justify-between text-sm md:text-base">
                <span class="text-gray-600">Roll Number:</span>
                <span class="font-medium">{{ selectedUser.rollNumber || 'N/A' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="space-y-2">
            <button 
              @click="startChatWithUser"
              class="w-full bg-green-500 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm md:text-base"
            >
              Start Chat
            </button>
            <button 
              @click="sendChatRequestToUser"
              class="w-full bg-blue-500 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm md:text-base"
            >
              Send Chat Request
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Chat Modal -->
    <NewChatModal 
      v-if="showNewChatModal"
      :pre-selected-user="selectedUserForModal"
      @close="closeNewChatModal"
      @chat-request-sent="handleChatRequestSent"
    />

    <!-- Chat Requests Modal -->
    <ChatRequestsModal 
      v-if="showChatRequests"
      @close="showChatRequests = false"
      @request-responded="handleRequestResponded"
    />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import ChatWindow from '../components/ChatWindow.vue';
import NewChatModal from '../components/NewChatModal.vue';
import ChatRequestsModal from '../components/ChatRequestsModal.vue';

export default {
  name: 'Chat',
  components: {
    ChatWindow,
    NewChatModal,
    ChatRequestsModal
  },
  data() {
    return {
      showNewChatModal: false,
      showChatRequests: false,
      searchQuery: '',
      loadingUsers: false,
      allUsers: [],
      selectedUser: null,
      selectedUserForModal: null,
      showSidebar: false
    };
  },
  computed: {
    ...mapState('chat', ['chats', 'currentChat', 'messages', 'isConnected']),
    ...mapGetters('chat', ['getOnlineStatus', 'getTypingUsers', 'unreadChatRequests']),
    
    
    filteredUsers() {
      if (!Array.isArray(this.allUsers)) return [];
      if (!this.searchQuery) return this.allUsers;
      const query = this.searchQuery.toLowerCase();
      return this.allUsers.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.college?.name.toLowerCase().includes(query) ||
        user.department?.name.toLowerCase().includes(query)
      );
    },
    
    onlineUsers() {
      if (!Array.isArray(this.filteredUsers)) return [];
      return this.filteredUsers.filter(user => {
        const status = this.getOnlineStatus(user.id);
        return status.status === 'online';
      });
    },
    
    offlineUsers() {
      if (!Array.isArray(this.filteredUsers)) return [];
      return this.filteredUsers.filter(user => {
        const status = this.getOnlineStatus(user.id);
        return status.status !== 'online';
      });
    }
  },
  watch: {
    // Auto-select first chat when chats are loaded
    chats: {
      handler(newChats) {
        console.log('Chats watcher triggered - newChats length:', newChats.length, 'currentChat:', this.currentChat);
        this.autoSelectFirstChat();
      },
      immediate: false
    }
  },
  async mounted() {
    console.log('Chat component mounted');
    
    // Clear any existing chat state
    this.$store.commit('chat/SET_CURRENT_CHAT', null);
    this.$store.commit('chat/SET_MESSAGES', []);
    
    console.log('Fetching chats...');
    const fetchedChats = await this.fetchChats();
    console.log('Chats after fetch:', fetchedChats.length);
    console.log('Store chats:', this.chats.length);
    
    await this.fetchChatRequests();
    await this.loadAllUsers();
    await this.initializeSocket();
    
    // Auto-select the first available chat if no chat is currently selected
    if (fetchedChats.length > 0) {
      console.log('Auto-selecting first chat from fetched data:', fetchedChats[0]);
      this.selectChat(fetchedChats[0]);
    } else {
      // Use the store data as fallback
      this.autoSelectFirstChat();
      
      // Use nextTick to ensure the DOM is updated and chats are properly set
      this.$nextTick(() => {
        console.log('NextTick - Checking for auto-select - chats length:', this.chats.length, 'currentChat:', this.currentChat);
        this.autoSelectFirstChat();
      });
      
      // Fallback: Try again after a short delay to handle any race conditions
      setTimeout(() => {
        console.log('Timeout fallback - Checking for auto-select - chats length:', this.chats.length, 'currentChat:', this.currentChat);
        this.autoSelectFirstChat();
      }, 1000);
    }
  },
  beforeUnmount() {
    this.disconnectSocket();
  },
  methods: {
    ...mapActions('chat', [
      'fetchChats',
      'fetchMessages',
      'fetchChatRequests',
      'initializeSocket',
      'disconnectSocket',
      'sendMessage',
      'sendTyping',
      'markMessagesAsRead',
      'joinChat',
      'leaveChat'
    ]),
    
    autoSelectFirstChat() {
      console.log('Auto-select method - chats length:', this.chats.length, 'currentChat:', this.currentChat);
      if (this.chats.length > 0 && !this.currentChat) {
        console.log('Auto-selecting first chat:', this.chats[0]);
        this.selectChat(this.chats[0]);
      }
    },
    
    async selectChat(chat) {
      if (this.currentChat?.id === chat.id) return;
      
      console.log('Selecting chat:', chat.id);
      
      if (this.currentChat) {
        this.leaveChat(this.currentChat.id);
      }
      
      this.$store.commit('chat/SET_CURRENT_CHAT', chat);
      await this.fetchMessages({ chatId: chat.id });
      this.joinChat(chat.id);
      
      console.log('Chat selected and messages fetched');
    },
    
    getChatDisplayName(chat) {
      if (chat.isGroup) {
        return chat.name || 'Group Chat';
      }
      
      const otherParticipant = this.getOtherParticipant(chat);
      return otherParticipant ? otherParticipant.name : 'Unknown User';
    },
    
    getOtherParticipant(chat) {
      if (!chat.participants) return null;
      const currentUserId = this.$store.state.auth.user?.id;
      return chat.participants.find(p => p.user?.id !== currentUserId)?.user;
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
      return date.toLocaleDateString();
    },
    
    closeNewChatModal() {
      this.showNewChatModal = false;
      this.selectedUserForModal = null;
    },
    
    handleChatRequestSent() {
      this.closeNewChatModal();
      this.fetchChatRequests();
    },
    
    handleRequestResponded() {
      this.fetchChatRequests();
      this.fetchChats();
    },
    
    async loadAllUsers() {
      this.loadingUsers = true;
      try {
        console.log('=== LOADING USERS DEBUG ===');
        console.log('Current user:', this.$store.state.auth.user);
        console.log('Auth token exists:', !!localStorage.getItem('token'));
        
        const response = await this.$store.dispatch('auth/getAllUsers');
        console.log('Raw API response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        
        // Ensure response is always an array
        this.allUsers = Array.isArray(response) ? response : [];
        console.log('Final allUsers array:', this.allUsers);
        console.log('AllUsers length:', this.allUsers.length);
        console.log('=== END LOADING USERS DEBUG ===');
      } catch (error) {
        console.error('=== ERROR LOADING USERS ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        this.allUsers = [];
      } finally {
        this.loadingUsers = false;
      }
    },
    
    async refreshUsers() {
      await this.loadAllUsers();
    },
    
    async selectUser(user) {
      this.selectedUser = user;
      
      // Close sidebar on mobile
      this.showSidebar = false;
      
      // Check if chat already exists with this user
      const existingChat = this.chats.find(chat => {
        if (!chat.participants || chat.participants.length !== 2) return false;
        const otherParticipant = chat.participants.find(p => p.user?.id !== this.$store.state.auth.user?.id);
        return otherParticipant?.user?.id === user.id;
      });
      
      if (existingChat) {
        // Select existing chat
        this.selectChat(existingChat);
      } else {
        // Pre-select the user for the modal and show it
        this.selectedUserForModal = user;
        this.showNewChatModal = true;
      }
    },
    
    async startChatWithUser() {
      if (!this.selectedUser) return;
      
      // Check if chat already exists with this user
      const existingChat = this.chats.find(chat => {
        if (!chat.participants || chat.participants.length !== 2) return false;
        const otherParticipant = chat.participants.find(p => p.user?.id !== this.$store.state.auth.user?.id);
        return otherParticipant?.user?.id === this.selectedUser.id;
      });
      
      if (existingChat) {
        this.selectChat(existingChat);
        this.selectedUser = null;
      } else {
        // Pre-select the user for the modal and show it
        this.selectedUserForModal = this.selectedUser;
        this.showNewChatModal = true;
        this.selectedUser = null;
      }
    },
    
    async sendChatRequestToUser() {
      if (!this.selectedUser) return;
      
      try {
        await this.sendChatRequest({
          receiverId: this.selectedUser.id,
          message: `Hi! I'd like to chat with you.`
        });
        
        // Show success message or notification
        this.selectedUser = null;
        // Refresh chat requests
        await this.fetchChatRequests();
      } catch (error) {
        console.error('Error sending chat request:', error);
      }
    },
    
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    }
  }
};
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
