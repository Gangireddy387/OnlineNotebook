<template>
  <div class="flex flex-col h-full bg-gray-100">
    <!-- Chat Header -->
    <div class="px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- Back button for mobile -->
          <button 
            @click="$emit('back')"
            class="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <div class="relative">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              {{ getOtherParticipant?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div 
              v-if="getOtherParticipant"
              class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              :class="onlineStatus(getOtherParticipant.id).status === 'online' ? 'bg-green-500' : 'bg-gray-400'"
            ></div>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ getOtherParticipant?.name || 'Unknown User' }}</h3>
            <p class="text-xs text-gray-500">
              {{ onlineStatus(getOtherParticipant?.id).status === 'online' ? 'Online' : 'Last seen recently' }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-1">
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
    <div class="flex-1 overflow-y-auto bg-gray-100 p-2 md:p-4 whatsapp-bg" ref="messagesContainer">
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <p class="text-lg font-medium mb-2">No messages yet</p>
        <p class="text-sm text-center max-w-xs">Start the conversation by sending a message below</p>
      </div>
      
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="flex mb-1"
        :class="message.sender.id === currentUserId ? 'justify-end' : 'justify-start'"
      >
        <!-- Sender's messages (right side) -->
        <div v-if="message.sender.id === currentUserId" class="flex items-end space-x-1 max-w-xs lg:max-w-md">
          <div class="flex flex-col items-end">
            <!-- Message bubble -->
            <div class="bg-green-400 text-gray-900 px-3 py-2 rounded-lg shadow-sm max-w-full" 
                 :class="{
                   'rounded-br-sm': true,
                   'rounded-tr-lg': true,
                   'rounded-tl-lg': true,
                   'rounded-bl-lg': true
                 }">
              <!-- Reply indicator -->
              <div v-if="message.replyToMessage" class="mb-2 p-2 bg-green-600 bg-opacity-30 rounded border-l-2 border-green-300">
                <p class="text-xs font-medium text-green-100">{{ message.replyToMessage.sender.name }}</p>
                <p class="text-xs text-green-100 truncate">{{ message.replyToMessage.content }}</p>
              </div>
              
              <p class="text-sm leading-relaxed break-words">{{ message.content }}</p>
              
              <!-- Message metadata -->
              <div class="flex items-center justify-end mt-1 space-x-1">
                <span class="text-xs opacity-70">{{ formatMessageTime(message.createdAt) }}</span>
                <!-- Read status icons -->
                <div class="flex items-center">
                  <svg v-if="message.isRead" class="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-3 h-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Receiver's messages (left side) -->
        <div v-else class="flex items-end space-x-1 max-w-xs lg:max-w-md">
          <div class="flex flex-col items-start">
            <!-- Message bubble -->
            <div class="bg-white text-gray-900 px-3 py-2 rounded-lg shadow-sm max-w-full border border-gray-200"
                 :class="{
                   'rounded-bl-sm': true,
                   'rounded-tl-lg': true,
                   'rounded-tr-lg': true,
                   'rounded-br-lg': true
                 }">
              <!-- Reply indicator -->
              <div v-if="message.replyToMessage" class="mb-2 p-2 bg-gray-100 rounded border-l-2 border-blue-500">
                <p class="text-xs font-medium text-gray-600">{{ message.replyToMessage.sender.name }}</p>
                <p class="text-xs text-gray-600 truncate">{{ message.replyToMessage.content }}</p>
              </div>
              
              <p class="text-sm leading-relaxed break-words">{{ message.content }}</p>
              
              <!-- Message metadata -->
              <div class="flex items-center justify-start mt-1">
                <span class="text-xs text-gray-500">{{ formatMessageTime(message.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Typing indicator -->
      <div v-if="typingUsers.length > 0" class="flex justify-start mb-1">
        <div class="flex items-end space-x-1">
          <div class="flex flex-col items-start">
            <!-- Typing bubble -->
            <div class="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <div class="flex items-center space-x-1">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-3 bg-white border-t border-gray-200 relative">
      <div class="flex items-center space-x-2">
        <!-- Attachment button -->
        <button class="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
          </svg>
        </button>
        
        <!-- Message input container -->
        <div class="flex-1 relative">
          <div class="flex items-center bg-gray-100 rounded-full px-3 py-2 min-h-[40px]">
            <!-- Emoji button -->
            <button 
              @click="showEmojiPicker = !showEmojiPicker"
              class="p-1 text-gray-500 hover:text-gray-700 transition-colors mr-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            
            <!-- Text input -->
            <textarea
              v-model="newMessage"
              @keydown="handleKeyDown"
              @input="handleTyping"
              placeholder="Type a message..."
              class="flex-1 bg-transparent border-none outline-none resize-none text-sm placeholder-gray-500"
              rows="1"
              ref="messageInput"
              style="min-height: 20px; max-height: 100px;"
            ></textarea>
          </div>
        </div>
        
        <!-- Send button -->
        <button 
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="p-2 text-white rounded-full transition-all duration-200"
          :class="newMessage.trim() ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Auto-resize textarea */
textarea {
  line-height: 1.4;
  font-family: inherit;
}

/* Message bubble animations */
.message-bubble {
  transition: all 0.2s ease;
  word-wrap: break-word;
  word-break: break-word;
}

/* Typing animation */
@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
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

/* WhatsApp-like message styling */
.bg-green-400 {
  background-color: #dcf8c6 !important;
  color: #303030 !important;
}

/* Input focus styles */
textarea:focus {
  outline: none;
}

/* Send button animation */
button:disabled {
  cursor: not-allowed;
}

/* Message container styling */
.break-words {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

/* WhatsApp background pattern */
.whatsapp-bg {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><circle cx="50" cy="50" r="1" fill="%23e0e0e0"/></svg>');
  background-size: 50px 50px;
}
</style>
