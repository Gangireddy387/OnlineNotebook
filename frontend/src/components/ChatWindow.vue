<template>
  <div class="flex flex-col h-full">
    <!-- Chat Header -->
    <div class="p-4 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {{ getOtherParticipant?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div 
              v-if="getOtherParticipant"
              class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
              :class="onlineStatus(getOtherParticipant.id).status === 'online' ? 'bg-green-500' : 'bg-gray-400'"
            ></div>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 text-lg">{{ getOtherParticipant?.name || 'Unknown User' }}</h3>
            <div class="flex items-center space-x-2">
              <div 
                class="w-2 h-2 rounded-full"
                :class="onlineStatus(getOtherParticipant?.id).status === 'online' ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
              <p class="text-sm text-gray-500">
                {{ onlineStatus(getOtherParticipant?.id).status === 'online' ? 'Online' : 'Offline' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </button>
          <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
          <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4" ref="messagesContainer">
      <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
        <p>No messages yet. Start the conversation!</p>
      </div>
      
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="flex mb-4"
        :class="message.sender.id === currentUserId ? 'justify-end' : 'justify-start'"
      >
        <!-- Sender's messages (right side) -->
        <div v-if="message.sender.id === currentUserId" class="flex items-end space-x-2 max-w-xs lg:max-w-md">
          <div class="flex flex-col items-end space-y-1">
            <!-- Message bubble -->
            <div class="sender-message text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm message-bubble">
              <!-- Reply indicator -->
              <div v-if="message.replyToMessage" class="mb-2 p-2 bg-green-600 bg-opacity-30 rounded border-l-4 border-green-300">
                <p class="text-xs font-medium text-green-100">{{ message.replyToMessage.sender.name }}</p>
                <p class="text-xs text-green-100 truncate">{{ message.replyToMessage.content }}</p>
              </div>
              
              <p class="text-sm leading-relaxed">{{ message.content }}</p>
            </div>
            
            <!-- Message metadata -->
            <div class="flex items-center space-x-1 text-xs text-gray-500">
              <span>{{ formatMessageTime(message.createdAt) }}</span>
              <!-- Read status icons -->
              <div class="flex items-center space-x-1">
                <svg v-if="message.isRead" class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Sender avatar -->
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {{ message.sender.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>

        <!-- Receiver's messages (left side) -->
        <div v-else class="flex items-end space-x-2 max-w-xs lg:max-w-md">
          <!-- Receiver avatar -->
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {{ message.sender.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          
          <div class="flex flex-col items-start space-y-1">
            <!-- Sender name -->
            <div class="text-xs text-gray-600 font-medium px-2">
              {{ message.sender.name }}
            </div>
            
            <!-- Message bubble -->
            <div class="receiver-message text-gray-900 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm message-bubble">
              <!-- Reply indicator -->
              <div v-if="message.replyToMessage" class="mb-2 p-2 bg-gray-100 rounded border-l-4 border-blue-500">
                <p class="text-xs font-medium text-gray-600">{{ message.replyToMessage.sender.name }}</p>
                <p class="text-xs text-gray-600 truncate">{{ message.replyToMessage.content }}</p>
              </div>
              
              <p class="text-sm leading-relaxed">{{ message.content }}</p>
            </div>
            
            <!-- Message metadata -->
            <div class="text-xs text-gray-500 px-2">
              {{ formatMessageTime(message.createdAt) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Typing indicator -->
      <div v-if="typingUsers.length > 0" class="flex justify-start mb-4">
        <div class="flex items-end space-x-2">
          <!-- Other participant avatar -->
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {{ getOtherParticipant?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          
          <div class="flex flex-col items-start space-y-1">
            <!-- Typing indicator name -->
            <div class="text-xs text-gray-600 font-medium px-2">
              {{ getOtherParticipant?.name || 'Someone' }}
            </div>
            
            <!-- Typing bubble -->
            <div class="receiver-message rounded-2xl rounded-bl-md px-4 py-2 shadow-sm message-bubble">
              <div class="flex items-center space-x-2">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                </div>
                <span class="text-xs text-gray-500">typing...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Message Input -->
    <div class="p-4 bg-white border-t border-gray-200 relative">
      <div class="flex items-end space-x-3">
        <button class="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
          </svg>
        </button>
        
        <button 
          @click="showEmojiPicker = !showEmojiPicker"
          class="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
        
        <div class="flex-1 relative">
          <textarea
            v-model="newMessage"
            @keydown="handleKeyDown"
            @input="handleTyping"
            placeholder="Type a message..."
            class="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="1"
            ref="messageInput"
          ></textarea>
        </div>
        
        <button 
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
      
      <!-- Emoji Picker -->
      <EmojiPicker 
        v-if="showEmojiPicker"
        @emoji-selected="addEmoji"
        @close="showEmojiPicker = false"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import EmojiPicker from './EmojiPicker.vue';

export default {
  name: 'ChatWindow',
  components: {
    EmojiPicker
  },
  props: {
    chat: {
      type: Object,
      required: true
    },
    messages: {
      type: Array,
      default: () => []
    },
    onlineStatus: {
      type: Function,
      required: true
    },
    typingUsers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      newMessage: '',
      isTyping: false,
      typingTimeout: null,
      showEmojiPicker: false
    };
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('chat', ['messages']),
    
    currentUserId() {
      return this.user?.id;
    },
    
    getOtherParticipant() {
      if (!this.chat.participants) return null;
      return this.chat.participants.find(p => p.user.id !== this.currentUserId)?.user;
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    }
  },
  mounted() {
    this.scrollToBottom();
    this.markMessagesAsRead();
  },
  methods: {
    async sendMessage() {
      if (!this.newMessage.trim()) return;
      
      await this.$emit('send-message', {
        chatId: this.chat.id,
        content: this.newMessage.trim(),
        type: 'text'
      });
      
      this.newMessage = '';
      this.stopTyping();
      this.adjustTextareaHeight();
    },
    
    handleKeyDown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    },
    
    handleTyping() {
      this.adjustTextareaHeight();
      
      if (!this.isTyping) {
        this.isTyping = true;
        this.$emit('send-typing', { chatId: this.chat.id, isTyping: true });
      }
      
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.stopTyping();
      }, 1000);
    },
    
    stopTyping() {
      if (this.isTyping) {
        this.isTyping = false;
        this.$emit('send-typing', { chatId: this.chat.id, isTyping: false });
      }
    },
    
    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    
    markMessagesAsRead() {
      this.$emit('mark-read', this.chat.id);
    },
    
    formatMessageTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
    },
    
    addEmoji(emoji) {
      this.newMessage += emoji;
      this.adjustTextareaHeight();
      this.$nextTick(() => {
        this.$refs.messageInput.focus();
      });
    }
  },
  
  beforeUnmount() {
    clearTimeout(this.typingTimeout);
    this.stopTyping();
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

/* Auto-resize textarea */
textarea {
  min-height: 40px;
  max-height: 120px;
}

/* Message bubble animations */
.message-bubble {
  transition: all 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Sender message styling */
.sender-message {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Receiver message styling */
.receiver-message {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 1px solid #e5e7eb;
}

/* Typing animation */
@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.typing-dot {
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
