<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-4 md:p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-base md:text-lg font-semibold text-gray-900">New Chat</h3>
          <button 
            @click="$emit('close')"
            class="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="p-4 md:p-6">
        <div class="relative mb-4">
          <input
            v-model="searchQuery"
            @input="performSearch"
            type="text"
            placeholder="Search users by name or email..."
            class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg class="absolute right-3 top-3 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <!-- Pre-selected User -->
        <div v-if="selectedUser && !searchQuery" class="mb-4">
          <div class="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="relative">
              <div class="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                {{ selectedUser.name.charAt(0).toUpperCase() }}
              </div>
              <div 
                class="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white"
                :class="selectedUser.onlineStatus?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 truncate text-sm md:text-base">{{ selectedUser.name }}</h4>
              <p class="text-xs md:text-sm text-gray-500 truncate">{{ selectedUser.email }}</p>
              <p class="text-xs text-gray-400 hidden md:block">
                {{ selectedUser.college?.name }} • {{ selectedUser.department?.name }}
              </p>
            </div>
            <div class="text-xs text-green-600 font-medium">
              Selected
            </div>
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="user in searchResults" 
            :key="user.id"
            @click="selectUser(user)"
            class="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-green-50 border border-green-200': selectedUser && selectedUser.id === user.id }"
          >
            <div class="relative">
              <div class="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div 
                class="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white"
                :class="user.onlineStatus?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 truncate text-sm md:text-base">{{ user.name }}</h4>
              <p class="text-xs md:text-sm text-gray-500 truncate">{{ user.email }}</p>
              <p class="text-xs text-gray-400 hidden md:block">
                {{ user.college?.name }} • {{ user.department?.name }}
              </p>
            </div>
            <div class="text-xs text-gray-500 hidden md:block">
              {{ user.onlineStatus?.status === 'online' ? 'Online' : 'Offline' }}
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="searchQuery && searchResults.length === 0" class="text-center py-8">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-gray-500">No users found</p>
        </div>

        <!-- Initial State -->
        <div v-else-if="!selectedUser" class="text-center py-8">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="text-gray-500">Search for users to start a chat</p>
        </div>
      </div>

      <!-- Chat Request Form -->
      <div v-if="selectedUser" class="p-4 md:p-6 border-t border-gray-200">
        <div class="mb-4">
          <div class="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
              {{ selectedUser.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="font-medium text-gray-900 text-sm md:text-base">{{ selectedUser.name }}</h4>
              <p class="text-xs md:text-sm text-gray-500">{{ selectedUser.email }}</p>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            v-model="chatRequestMessage"
            placeholder="Add a personal message..."
            class="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows="3"
          ></textarea>
        </div>

        <div class="flex space-x-2 md:space-x-3">
          <button 
            @click="cancelSelection"
            class="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="sendChatRequestAction"
            :disabled="sending"
            class="flex-1 px-3 md:px-4 py-2 text-sm md:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ sending ? 'Sending...' : 'Send Request' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'NewChatModal',
  props: {
    preSelectedUser: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedUser: null,
      chatRequestMessage: '',
      sending: false,
      searchTimeout: null
    };
  },
  mounted() {
    // If a user is pre-selected, set it as selected
    if (this.preSelectedUser) {
      this.selectedUser = this.preSelectedUser;
    }
  },
  watch: {
    // Watch for changes in preSelectedUser prop
    preSelectedUser: {
      handler(newUser) {
        if (newUser) {
          this.selectedUser = newUser;
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('chat', ['searchUsers', 'sendChatRequest']),
    
    async performSearch() {
      if (!this.searchQuery || this.searchQuery.length < 2) {
        this.searchResults = [];
        return;
      }
      
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(async () => {
        try {
          const results = await this.searchUsers(this.searchQuery);
          this.searchResults = results;
        } catch (error) {
          console.error('Error searching users:', error);
        }
      }, 300);
    },
    
    selectUser(user) {
      this.selectedUser = user;
    },
    
    cancelSelection() {
      this.selectedUser = null;
      this.chatRequestMessage = '';
    },
    
    async sendChatRequestAction() {
      if (!this.selectedUser || this.sending) return;
      
      this.sending = true;
      try {
        await this.sendChatRequest({
          receiverId: this.selectedUser.id,
          message: this.chatRequestMessage.trim()
        });
        
        this.$emit('chat-request-sent');
        this.resetForm();
      } catch (error) {
        console.error('Error sending chat request:', error);
        // Handle error (show notification, etc.)
      } finally {
        this.sending = false;
      }
    },
    
    resetForm() {
      this.selectedUser = null;
      this.chatRequestMessage = '';
      this.searchQuery = '';
      this.searchResults = [];
    }
  },
  
  beforeUnmount() {
    clearTimeout(this.searchTimeout);
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
