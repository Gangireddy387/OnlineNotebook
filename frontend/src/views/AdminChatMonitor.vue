<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div class="mb-4 lg:mb-0">
              <h1 class="text-3xl font-bold text-gray-900">Chat Monitor</h1>
              <p class="text-gray-600 mt-1">Monitor all conversations and chat activity across the platform</p>
            </div>
            
            <!-- Statistics Grid -->
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-600">{{ allChats.length }}</div>
                <div class="text-sm text-gray-500 mt-1">Total Chats</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">{{ activeUsers }}</div>
                <div class="text-sm text-gray-500 mt-1">Active Users</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">{{ totalMessages }}</div>
                <div class="text-sm text-gray-500 mt-1">Total Messages</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-orange-600">{{ todayMessages }}</div>
                <div class="text-sm text-gray-500 mt-1">Today's Messages</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-indigo-600">{{ directMessages }}</div>
                <div class="text-sm text-gray-500 mt-1">Direct Messages</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-pink-600">{{ groupChats }}</div>
                <div class="text-sm text-gray-500 mt-1">Group Chats</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Controls -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <!-- Search -->
            <div class="lg:col-span-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search chats or participants..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-search text-gray-400"></i>
                </div>
              </div>
            </div>
            
            <!-- Date From -->
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                v-model="dateFrom"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <!-- Date To -->
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                v-model="dateTo"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <!-- Action Buttons -->
            <div class="lg:col-span-4 flex space-x-3">
              <button
                @click="loadAllChats"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                Refresh
              </button>
              
              <button
                @click="exportChatLogs"
                :disabled="!selectedChat"
                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <i class="fas fa-download mr-2"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chat List -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">All Conversations</h2>
                <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  {{ filteredChats.length }} chats
                </span>
              </div>
            </div>
            <div class="max-h-[600px] overflow-y-auto">
              <div v-if="loading" class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p class="text-gray-500 mt-4">Loading chats...</p>
              </div>
              <div v-else-if="filteredChats.length === 0" class="p-8 text-center text-gray-500">
                <i class="fas fa-comments text-4xl text-gray-300 mb-4"></i>
                <p class="text-lg font-medium">{{ searchQuery ? 'No chats match your search' : 'No chats found' }}</p>
                <p class="text-sm mt-2">{{ searchQuery ? 'Try adjusting your search criteria' : 'Chats will appear here when users start conversations' }}</p>
              </div>
              <div v-else>
                <div 
                  v-for="chat in filteredChats" 
                  :key="chat.id"
                  @click="selectChat(chat)"
                  class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  :class="{ 'bg-blue-50 border-l-4 border-l-blue-500': selectedChat?.id === chat.id }"
                >
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {{ getChatDisplayName(chat).charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 truncate text-lg">
                        {{ getChatDisplayName(chat) }}
                      </h3>
                      <p class="text-sm text-gray-600 truncate mt-1">
                        {{ getParticipantsText(chat) }}
                      </p>
                      <div class="flex items-center justify-between mt-2">
                        <p class="text-xs text-gray-500">
                          {{ chat.lastMessageAt ? formatTime(chat.lastMessageAt) : 'No messages yet' }}
                        </p>
                        <div class="flex items-center space-x-2">
                          <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            {{ chat.messages?.length || 0 }} msgs
                          </span>
                          <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                            {{ chat.participants?.length || 0 }} users
                          </span>
                        </div>
                      </div>
                      <p class="text-xs text-gray-400 mt-1">
                        Created: {{ formatTime(chat.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="lg:col-span-2">
          <div v-if="!selectedChat" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div class="max-w-md mx-auto">
              <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-comments text-3xl text-blue-500"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Select a conversation to monitor</h3>
              <p class="text-gray-600 mb-6">Choose from the list on the left to view messages and participant details</p>
              <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div class="flex items-center justify-center mb-4">
                  <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                  <h4 class="font-semibold text-gray-900">Available Features</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div class="flex items-center">
                    <i class="fas fa-eye text-green-500 mr-2"></i>
                    View all messages
                  </div>
                  <div class="flex items-center">
                    <i class="fas fa-users text-blue-500 mr-2"></i>
                    See participant info
                  </div>
                  <div class="flex items-center">
                    <i class="fas fa-download text-purple-500 mr-2"></i>
                    Export chat logs
                  </div>
                  <div class="flex items-center">
                    <i class="fas fa-trash text-red-500 mr-2"></i>
                    Delete messages
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Chat Header -->
            <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {{ getChatDisplayName(selectedChat).charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900">{{ getChatDisplayName(selectedChat) }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ getParticipantsText(selectedChat) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="flex items-center space-x-4">
                    <div class="text-center">
                      <div class="text-lg font-bold text-blue-600">{{ selectedChat.messages?.length || 0 }}</div>
                      <div class="text-xs text-gray-500">Messages</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-bold text-purple-600">{{ selectedChat.participants?.length || 0 }}</div>
                      <div class="text-xs text-gray-500">Participants</div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    Created {{ formatTime(selectedChat.createdAt) }}
                  </p>
                </div>
              </div>
              
              <!-- Bulk Actions -->
              <div v-if="selectedChatMessages.length > 0" class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        :indeterminate="isPartiallySelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span class="text-sm font-medium text-gray-700">
                        Select All Messages
                      </span>
                    </label>
                    <span v-if="selectedMessagesCount > 0" class="text-sm text-blue-600 font-medium">
                      {{ selectedMessagesCount }} selected
                    </span>
                  </div>
                  <button
                    v-if="selectedMessagesCount > 0"
                    @click="deleteAllSelected"
                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <i class="fas fa-trash"></i>
                    <span>Delete Selected ({{ selectedMessagesCount }})</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div class="max-h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
              <div v-if="selectedChatMessages.length === 0" class="text-center text-gray-500 py-12">
                <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-comment-slash text-2xl text-gray-400"></i>
                </div>
                <p class="text-lg font-medium">No messages in this conversation</p>
                <p class="text-sm mt-2">Messages will appear here when users start chatting</p>
              </div>
              <div 
                v-for="(message, index) in selectedChatMessages" 
                :key="message.id"
                class="flex items-start space-x-3"
                :class="getMessageAlignment(message, index)"
              >
                <!-- Checkbox -->
                <div class="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    :checked="isMessageSelected(message.id)"
                    @change="toggleMessageSelection(message.id)"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                
                <!-- Message Content -->
                <div 
                  class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm flex-1"
                  :class="getMessageStyle(message, index)"
                >
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                         :class="getAvatarStyle(message, index)">
                      {{ message.sender.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-xs font-medium">{{ message.sender.name }}</span>
                    <span class="text-xs opacity-75">
                      {{ formatMessageTime(message.createdAt) }}
                    </span>
                  </div>
                  <p class="text-sm leading-relaxed">{{ message.content }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs opacity-75">
                      {{ message.type }}
                    </span>
                    <div class="flex items-center space-x-2">
                      <span v-if="message.isRead" class="text-xs opacity-75">
                        <i class="fas fa-check-double"></i> Read
                      </span>
                      <button
                        @click="deleteMessage(message.id)"
                        class="text-xs opacity-75 hover:opacity-100 transition-opacity"
                        title="Delete message"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Delete Message"
      message="Are you sure you want to delete this message? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDeleteMessage"
      @cancel="cancelDeleteMessage"
      @close="cancelDeleteMessage"
    />

    <!-- Bulk Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showBulkDeleteModal"
      title="Delete Selected Messages"
      :message="`Are you sure you want to delete ${selectedMessagesCount} selected messages? This action cannot be undone.`"
      confirm-text="Delete All"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmBulkDelete"
      @cancel="cancelBulkDelete"
      @close="cancelBulkDelete"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { useNotification } from '@/composables/useNotification';
import api from '@/api/axios';

export default {
  name: 'AdminChatMonitor',
  components: {
    ConfirmationModal
  },
  setup() {
    const { showToast } = useNotification();
    return { showToast };
  },
  data() {
    return {
      allChats: [],
      selectedChat: null,
      selectedChatMessages: [],
      loading: false,
      activeUsers: 0,
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      showDeleteModal: false,
      messageToDelete: null,
      selectedMessages: new Set(),
      showBulkDeleteModal: false
    };
  },
  computed: {
    ...mapState('auth', ['user']),
    
    currentUserId() {
      return this.user?.id;
    },
    
    filteredChats() {
      let chats = this.allChats;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        chats = chats.filter(chat => {
          const chatName = this.getChatDisplayName(chat).toLowerCase();
          const participants = this.getParticipantsText(chat).toLowerCase();
          return chatName.includes(query) || participants.includes(query);
        });
      }
      
      // Filter by date range
      if (this.dateFrom) {
        const fromDate = new Date(this.dateFrom);
        chats = chats.filter(chat => {
          const chatDate = new Date(chat.createdAt);
          return chatDate >= fromDate;
        });
      }
      
      if (this.dateTo) {
        const toDate = new Date(this.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        chats = chats.filter(chat => {
          const chatDate = new Date(chat.createdAt);
          return chatDate <= toDate;
        });
      }
      
      return chats;
    },
    
    totalMessages() {
      return this.allChats.reduce((total, chat) => {
        return total + (chat.messages?.length || 0);
      }, 0);
    },
    
    todayMessages() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.allChats.reduce((total, chat) => {
        if (chat.messages && chat.messages.length > 0) {
          const todayMsgCount = chat.messages.filter(msg => {
            const msgDate = new Date(msg.createdAt);
            return msgDate >= today;
          }).length;
          return total + todayMsgCount;
        }
        return total;
      }, 0);
    },
    
    directMessages() {
      return this.allChats.filter(chat => !chat.isGroup).length;
    },
    
    groupChats() {
      return this.allChats.filter(chat => chat.isGroup).length;
    },
    
    isAllSelected() {
      return this.selectedChatMessages.length > 0 && 
             this.selectedMessages.size === this.selectedChatMessages.length;
    },
    
    isPartiallySelected() {
      return this.selectedMessages.size > 0 && 
             this.selectedMessages.size < this.selectedChatMessages.length;
    },
    
    selectedMessagesCount() {
      return this.selectedMessages.size;
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
      this.selectedMessages.clear(); // Clear selections when switching chats
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
        // For direct messages, show both participants (sorted consistently)
        const participantNames = chat.participants
          .map(p => p.user.name)
          .sort(); // Sort alphabetically for consistent display
        
        if (participantNames.length === 2) {
          return `${participantNames[0]} ↔ ${participantNames[1]}`;
        } else if (participantNames.length === 1) {
          return participantNames[0];
        } else {
          return participantNames.join(', ');
        }
      }
      
      return 'Unknown Chat';
    },
    
    getParticipantsText(chat) {
      if (!chat.participants) return 'No participants';
      
      // Sort participants by name for consistent display
      const participantDetails = chat.participants
        .map(p => `${p.user.name} (${p.user.email})`)
        .sort(); // Sort alphabetically for consistent display
      
      if (participantDetails.length <= 2) {
        return participantDetails.join(', ');
      }
      
      return `${participantDetails.slice(0, 2).join(', ')} and ${participantDetails.length - 2} others`;
    },
    
    getMessageAlignment(message, index) {
      // Alternate sides for different users
      const participants = this.selectedChat?.participants || [];
      const participantIds = participants.map(p => p.user.id);
      const senderIndex = participantIds.indexOf(message.sender.id);
      
      // If sender is first participant, show on left; if second, show on right
      return senderIndex === 0 ? 'justify-start' : 'justify-end';
    },
    
    getMessageStyle(message, index) {
      // Alternate colors for different users
      const participants = this.selectedChat?.participants || [];
      const participantIds = participants.map(p => p.user.id);
      const senderIndex = participantIds.indexOf(message.sender.id);
      
      // If sender is first participant, use white; if second, use blue
      return senderIndex === 0 
        ? 'bg-white text-gray-900 border border-gray-200' 
        : 'bg-blue-500 text-white';
    },
    
    getAvatarStyle(message, index) {
      // Different avatar colors for different users
      const participants = this.selectedChat?.participants || [];
      const participantIds = participants.map(p => p.user.id);
      const senderIndex = participantIds.indexOf(message.sender.id);
      
      // If sender is first participant, use gray; if second, use blue
      return senderIndex === 0 
        ? 'bg-gray-300 text-gray-700' 
        : 'bg-blue-200 text-blue-800';
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
    },
    
    deleteMessage(messageId) {
      console.log('Delete message clicked for ID:', messageId);
      console.log('Message ID type:', typeof messageId);
      this.messageToDelete = messageId;
      this.showDeleteModal = true;
    },
    
    async confirmDeleteMessage() {
      if (!this.messageToDelete) return;
      
      console.log('Attempting to delete message:', this.messageToDelete);
      
      try {
        const response = await api.delete(`/chat/admin/message/${this.messageToDelete}`);
        console.log('Delete response:', response);
        
        if (response.status === 200) {
          // Remove the message from the local array
          this.selectedChatMessages = this.selectedChatMessages.filter(msg => msg.id !== this.messageToDelete);
          
          // Update the chat's message count
          if (this.selectedChat && this.selectedChat.messages) {
            this.selectedChat.messages = this.selectedChat.messages.filter(msg => msg.id !== this.messageToDelete);
          }
          
          // Show success notification
          this.showToast('Success!', 'Message deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        console.error('Error response:', error.response);
        this.showToast('Error!', `Failed to delete message: ${error.response?.data?.message || error.message}`, 'error');
      } finally {
        this.cancelDeleteMessage();
      }
    },
    
    cancelDeleteMessage() {
      this.showDeleteModal = false;
      this.messageToDelete = null;
    },
    
    // Selection methods
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedMessages.clear();
      } else {
        this.selectedChatMessages.forEach(message => {
          this.selectedMessages.add(message.id);
        });
      }
    },
    
    toggleMessageSelection(messageId) {
      if (this.selectedMessages.has(messageId)) {
        this.selectedMessages.delete(messageId);
      } else {
        this.selectedMessages.add(messageId);
      }
    },
    
    isMessageSelected(messageId) {
      return this.selectedMessages.has(messageId);
    },
    
    deleteAllSelected() {
      if (this.selectedMessages.size === 0) {
        this.showToast('Warning!', 'No messages selected', 'warning');
        return;
      }
      this.showBulkDeleteModal = true;
    },
    
    async confirmBulkDelete() {
      if (this.selectedMessages.size === 0) return;
      
      const messageIds = Array.from(this.selectedMessages);
      console.log('Attempting to delete messages:', messageIds);
      
      try {
        // Delete messages one by one (could be optimized with a bulk endpoint)
        const deletePromises = messageIds.map(messageId => 
          api.delete(`/chat/admin/message/${messageId}`)
        );
        
        const responses = await Promise.all(deletePromises);
        console.log('Bulk delete responses:', responses);
        
        // Remove deleted messages from local state
        this.selectedChatMessages = this.selectedChatMessages.filter(
          msg => !this.selectedMessages.has(msg.id)
        );
        
        // Update chat's message count
        if (this.selectedChat && this.selectedChat.messages) {
          this.selectedChat.messages = this.selectedChat.messages.filter(
            msg => !this.selectedMessages.has(msg.id)
          );
        }
        
        // Clear selections
        this.selectedMessages.clear();
        
        // Show success notification
        this.showToast('Success!', `${messageIds.length} messages deleted successfully`, 'success');
        
      } catch (error) {
        console.error('Error deleting messages:', error);
        this.showToast('Error!', `Failed to delete messages: ${error.response?.data?.message || error.message}`, 'error');
      } finally {
        this.cancelBulkDelete();
      }
    },
    
    cancelBulkDelete() {
      this.showBulkDeleteModal = false;
    },
    
    exportChatLogs() {
      if (!this.selectedChat) {
        this.showToast('Error!', 'Please select a chat to export', 'error');
        return;
      }
      
      try {
        // Create chat log data
        const chatData = {
          chat: {
            id: this.selectedChat.id,
            name: this.getChatDisplayName(this.selectedChat),
            participants: this.getParticipantsText(this.selectedChat),
            createdAt: this.selectedChat.createdAt,
            isGroup: this.selectedChat.isGroup
          },
          messages: this.selectedChatMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender.name,
            timestamp: msg.createdAt,
            type: msg.type
          })),
          exportedAt: new Date().toISOString(),
          totalMessages: this.selectedChatMessages.length
        };
        
        // Create and download JSON file
        const dataStr = JSON.stringify(chatData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat-log-${this.selectedChat.id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('Success!', 'Chat log exported successfully', 'success');
      } catch (error) {
        console.error('Error exporting chat logs:', error);
        this.showToast('Error!', 'Failed to export chat logs', 'error');
      }
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
