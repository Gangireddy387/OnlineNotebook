<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Chat Monitor</h1>
            <p class="text-gray-600 mt-1">Monitor all conversations and chat activity</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-sm text-gray-500">Total Chats</div>
              <div class="text-2xl font-bold text-green-600">{{ allChats.length }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Active Users</div>
              <div class="text-2xl font-bold text-blue-600">{{ activeUsers }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chat List -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">All Conversations</h2>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <div v-if="loading" class="p-4 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p class="text-gray-500 mt-2">Loading chats...</p>
              </div>
              <div v-else-if="allChats.length === 0" class="p-4 text-center text-gray-500">
                <p>No chats found</p>
              </div>
              <div v-else>
                <div 
                  v-for="chat in allChats" 
                  :key="chat.id"
                  @click="selectChat(chat)"
                  class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  :class="{ 'bg-green-50 border-green-200': selectedChat?.id === chat.id }"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {{ getChatDisplayName(chat).charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-gray-900 truncate">
                        {{ getChatDisplayName(chat) }}
                      </h3>
                      <p class="text-sm text-gray-500 truncate">
                        {{ getParticipantsText(chat) }}
                      </p>
                      <p class="text-xs text-gray-400">
                        {{ formatTime(chat.lastMessageAt) }}
                      </p>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ chat.messages?.length || 0 }} messages
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="lg:col-span-2">
          <div v-if="!selectedChat" class="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation to monitor</h3>
            <p class="text-gray-500">Choose from the list to view messages and participant details</p>
          </div>

          <div v-else class="bg-white rounded-lg shadow-sm">
            <!-- Chat Header -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ getChatDisplayName(selectedChat) }}</h3>
                  <p class="text-sm text-gray-500">{{ getParticipantsText(selectedChat) }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">
                    {{ selectedChat.messages?.length || 0 }} messages
                  </span>
                  <span class="text-xs text-gray-500">
                    Created {{ formatTime(selectedChat.createdAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div class="max-h-96 overflow-y-auto p-4 space-y-4">
              <div v-if="selectedChatMessages.length === 0" class="text-center text-gray-500 py-8">
                <p>No messages in this conversation</p>
              </div>
              <div 
                v-for="message in selectedChatMessages" 
                :key="message.id"
                class="flex"
                :class="message.sender.id === currentUserId ? 'justify-end' : 'justify-start'"
              >
                <div 
                  class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                  :class="message.sender.id === currentUserId 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-900'"
                >
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-xs font-medium">{{ message.sender.name }}</span>
                    <span class="text-xs opacity-75">
                      {{ formatMessageTime(message.createdAt) }}
                    </span>
                  </div>
                  <p class="text-sm">{{ message.content }}</p>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-xs opacity-75">
                      {{ message.type }}
                    </span>
                    <span v-if="message.isRead" class="text-xs opacity-75">
                      Read
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Info -->
            <div class="p-4 border-t border-gray-200 bg-gray-50">
              <h4 class="font-medium text-gray-900 mb-2">Participants</h4>
              <div class="space-y-2">
                <div 
                  v-for="participant in selectedChat.participants" 
                  :key="participant.id"
                  class="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {{ participant.user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ participant.user.name }}</p>
                      <p class="text-sm text-gray-500">{{ participant.user.email }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-500">Role: {{ participant.role }}</p>
                    <p class="text-xs text-gray-500">Joined: {{ formatTime(participant.joinedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AdminChatMonitor',
  data() {
    return {
      allChats: [],
      selectedChat: null,
      selectedChatMessages: [],
      loading: false,
      activeUsers: 0
    };
  },
  computed: {
    ...mapState('auth', ['user']),
    
    currentUserId() {
      return this.user?.id;
    }
  },
  async mounted() {
    await this.loadAllChats();
  },
  methods: {
    ...mapActions('chat', ['fetchAllChats', 'fetchAllMessages']),
    
    async loadAllChats() {
      this.loading = true;
      try {
        const chats = await this.fetchAllChats();
        this.allChats = chats;
        this.activeUsers = new Set(chats.flatMap(chat => 
          chat.participants?.map(p => p.user.id) || []
        )).size;
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async selectChat(chat) {
      this.selectedChat = chat;
      try {
        const messages = await this.fetchAllMessages(chat.id);
        this.selectedChatMessages = messages;
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    },
    
    getChatDisplayName(chat) {
      if (chat.isGroup) {
        return chat.name || 'Group Chat';
      }
      
      if (chat.participants && chat.participants.length > 0) {
        const otherParticipant = chat.participants.find(p => p.user.id !== this.currentUserId);
        return otherParticipant ? otherParticipant.user.name : 'Unknown User';
      }
      
      return 'Unknown Chat';
    },
    
    getParticipantsText(chat) {
      if (!chat.participants) return 'No participants';
      
      const participantNames = chat.participants.map(p => p.user.name);
      if (participantNames.length <= 2) {
        return participantNames.join(', ');
      }
      
      return `${participantNames.slice(0, 2).join(', ')} and ${participantNames.length - 2} others`;
    },
    
    formatTime(timestamp) {
      if (!timestamp) return 'Unknown';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
    },
    
    formatMessageTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
