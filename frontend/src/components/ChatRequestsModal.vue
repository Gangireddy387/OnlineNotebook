<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Chat Requests</h3>
          <button 
            @click="$emit('close')"
            class="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6">
          <button 
            @click="activeTab = 'received'"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="activeTab === 'received' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Received
            <span v-if="pendingReceivedRequests.length > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {{ pendingReceivedRequests.length }}
            </span>
          </button>
          <button 
            @click="activeTab = 'sent'"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="activeTab === 'sent' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Sent
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Received Requests -->
        <div v-if="activeTab === 'received'" class="p-6">
          <div v-if="receivedRequests.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="text-gray-500">No chat requests received</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="request in receivedRequests" 
              :key="request.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start space-x-3">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {{ request.requester?.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900">{{ request.requester?.name || 'Unknown User' }}</h4>
                  <p class="text-sm text-gray-500">{{ request.requester?.email || 'No email' }}</p>
                  <p v-if="request.message" class="text-sm text-gray-700 mt-2 italic">
                    "{{ request.message }}"
                  </p>
                  <p class="text-xs text-gray-400 mt-2">
                    {{ formatTime(request.createdAt) }}
                  </p>
                </div>
                <div v-if="request.status === 'pending'" class="flex space-x-2">
                  <button 
                    @click="respondToRequest(request.id, 'accepted')"
                    :disabled="responding === request.id"
                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {{ responding === request.id ? 'Accepting...' : 'Accept' }}
                  </button>
                  <button 
                    @click="respondToRequest(request.id, 'declined')"
                    :disabled="responding === request.id"
                    class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Decline
                  </button>
                </div>
                <div v-else class="flex items-center">
                  <span 
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getStatusClass(request.status)"
                  >
                    {{ request.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sent Requests -->
        <div v-if="activeTab === 'sent'" class="p-6">
          <div v-if="sentRequests.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <p class="text-gray-500">No chat requests sent</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="request in sentRequests" 
              :key="request.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start space-x-3">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {{ request.receiver?.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900">{{ request.receiver?.name || 'Unknown User' }}</h4>
                  <p class="text-sm text-gray-500">{{ request.receiver?.email || 'No email' }}</p>
                  <p v-if="request.message" class="text-sm text-gray-700 mt-2 italic">
                    "{{ request.message }}"
                  </p>
                  <p class="text-xs text-gray-400 mt-2">
                    {{ formatTime(request.createdAt) }}
                  </p>
                </div>
                <div class="flex items-center">
                  <span 
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getStatusClass(request.status)"
                  >
                    {{ request.status }}
                  </span>
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
  name: 'ChatRequestsModal',
  data() {
    return {
      activeTab: 'received',
      responding: null
    };
  },
  computed: {
    ...mapState('chat', ['chatRequests']),
    
    receivedRequests() {
      return (this.chatRequests.received || []).filter(request => request.status !== 'accepted');
    },
    
    sentRequests() {
      return (this.chatRequests.sent || []).filter(request => request.status !== 'accepted');
    },
    
    pendingReceivedRequests() {
      return (this.chatRequests.received || []).filter(request => request.status === 'pending');
    }
  },
  methods: {
    ...mapActions('chat', ['respondToChatRequest', 'fetchChatRequests']),
    
    async respondToRequest(requestId, status) {
      this.responding = requestId;
      try {
        await this.respondToChatRequest({ requestId, status });
        
        // Refresh chat requests to ensure UI is updated
        await this.fetchChatRequests();
        
        this.$emit('request-responded');
      } catch (error) {
        console.error('Error responding to chat request:', error);
      } finally {
        this.responding = null;
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'accepted':
          return 'bg-green-100 text-green-800';
        case 'declined':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
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
