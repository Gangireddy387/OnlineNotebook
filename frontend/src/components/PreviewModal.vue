<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-5" @click.self="closeModal">
    <div class="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b-2 border-gray-200">
        <div class="flex items-center gap-4">
          <i class="fas fa-eye text-2xl text-primary"></i>
          <h2 class="text-xl font-semibold text-gray-800">Preview: {{ note?.title }}</h2>
        </div>
        <button @click="closeModal" class="text-2xl text-gray-400 hover:text-red-500 transition-colors p-2">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <div class="flex gap-4 items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <span class="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold uppercase rounded-full">
            {{ note?.fileType }}
          </span>
          <span class="text-sm text-gray-600">{{ formatFileSize(note?.fileSize) }}</span>
          <span class="text-xs text-gray-500">Preview Type: {{ previewType }}</span>
        </div>

        <div class="flex-1 overflow-auto p-5 flex justify-center items-center">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-16">
            <div class="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-xl text-primary font-semibold">Loading preview...</p>
            <p class="text-sm text-gray-500 mt-2">Preview Type: {{ previewType }}</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-16 px-10">
            <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-5 block"></i>
            <h3 class="text-2xl font-semibold text-gray-800 mb-4">Preview Error</h3>
            <p class="text-gray-600 mb-2">{{ error }}</p>
            <a :href="downloadUrl" class="inline-block bg-success hover:bg-success-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              <i class="fas fa-download mr-2"></i> Download File
            </a>
          </div>

          <!-- PDF Preview -->
          <div v-else-if="isPDF" class="w-full h-full min-h-[500px] border border-gray-300 rounded-lg">
            <div class="p-4 bg-gray-100 border-b">
              <p class="text-sm text-gray-600">PDF Preview</p>
              <a :href="previewUrl" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Open in new tab</a>
            </div>
            <iframe
              :src="previewUrl"
              class="w-full h-full min-h-[400px]"
              frameborder="0"
              title="PDF Preview"
              @load="onIframeLoad"
              @error="onIframeError"
            ></iframe>
          </div>

          <!-- Image Preview -->
          <div v-else-if="isImage" class="w-full h-full min-h-[500px] border border-gray-300 rounded-lg">
            <div class="p-4 bg-gray-100 border-b">
              <p class="text-sm text-gray-600">Image Preview</p>
              <a :href="previewUrl" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Open in new tab</a>
            </div>
            <div class="flex justify-center items-center h-full min-h-[400px] p-4">
              <img
                :src="previewUrl"
                :alt="note?.title"
                class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                @load="onImageLoad"
                @error="onImageError"
              />
            </div>
          </div>

          <!-- Text File Preview -->
          <div v-else-if="isText" class="w-full h-full min-h-[500px] border border-gray-300 rounded-lg">
            <div class="p-4 bg-gray-100 border-b">
              <p class="text-sm text-gray-600">Text File Preview</p>
              <a :href="previewUrl" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Open in new tab</a>
            </div>
            <iframe
              :src="previewUrl"
              class="w-full h-full min-h-[400px]"
              frameborder="0"
              title="Text File Preview"
              @load="onIframeLoad"
              @error="onIframeError"
            ></iframe>
          </div>

          <!-- Office Documents Preview via Google Docs Viewer -->
          <div v-else-if="isOfficeDocument" class="w-full h-full min-h-[500px] border border-gray-300 rounded-lg">
            <div class="p-4 bg-gray-100 border-b">
              <p class="text-sm text-gray-600">Office Document Preview (via Google Docs Viewer)</p>
              <a :href="previewUrl" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Open original in new tab</a>
            </div>
            <iframe
              :src="officePreviewUrl"
              class="w-full h-full min-h-[400px]"
              frameborder="0"
              title="Office Document Preview"
              @load="onIframeLoad"
              @error="onIframeError"
            ></iframe>
          </div>

          <!-- Unsupported File Type -->
          <div v-else class="text-center py-16 px-10">
            <i class="fas fa-file-alt text-8xl text-gray-300 mb-5 block"></i>
            <h3 class="text-2xl font-semibold text-gray-800 mb-4">Preview not available</h3>
            <p class="text-gray-600 mb-2">This file type ({{ note?.fileType }}) cannot be previewed in the browser.</p>
            <p class="text-gray-800 font-semibold mb-5">File: {{ note?.fileName }}</p>
            <div class="space-y-2">
              <a :href="downloadUrl" class="inline-block bg-success hover:bg-success-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors mr-2">
                <i class="fas fa-download mr-2"></i> Download File
              </a>
              <a :href="previewUrl" target="_blank" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                <i class="fas fa-external-link-alt mr-2"></i> Try Opening Directly
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center p-6 border-t-2 border-gray-200 bg-gray-50">
        <div class="flex gap-4">
          <button @click="toggleComments" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <i class="fas fa-comments"></i>
            <span>Comments ({{ comments.length }})</span>
          </button>
        </div>
        <div class="flex gap-4">
          <button @click="closeModal" class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
            <i class="fas fa-times mr-2"></i> Close
          </button>
          <a :href="downloadUrl" class="px-6 py-2 bg-success hover:bg-success-dark text-white font-semibold rounded-lg transition-colors">
            <i class="fas fa-download mr-2"></i> Download
          </a>
        </div>
      </div>

      <!-- Comments Panel -->
      <div v-if="showComments" class="border-t-2 border-gray-200 bg-white max-h-96 overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-comments text-primary"></i>
            <span>Comments ({{ comments.length }})</span>
          </h3>

          <!-- Add Comment Form -->
          <div v-if="isAuthenticated && isApproved" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <textarea
              v-model="newComment"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none mb-3"
              placeholder="Write your comment here..."
              rows="2"
            ></textarea>
            <button 
              @click="handleAddComment" 
              class="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="!newComment.trim()"
            >
              <i class="fas fa-paper-plane"></i>
              <span>Post Comment</span>
            </button>
          </div>

          <div v-else-if="isAuthenticated && !isApproved" class="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">
            You need admin approval to post comments.
          </div>

          <div v-else class="mb-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm">
            Please <router-link to="/login" class="font-semibold underline">login</router-link> to post comments.
          </div>

          <!-- Comments List -->
          <div class="space-y-3">
            <div v-if="comments.length > 0">
              <div v-for="comment in comments" :key="comment.id" class="border border-gray-200 rounded-lg p-4 bg-white">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-user-circle text-xl text-primary"></i>
                    <div>
                      <strong class="block text-gray-800 text-sm font-semibold">{{ comment.user?.name }}</strong>
                      <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                  </div>
                  <button
                    v-if="canDeleteComment(comment)"
                    @click="handleDeleteComment(comment.id)"
                    class="text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Delete comment"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
                <p class="text-gray-700 text-sm leading-relaxed pl-6">{{ comment.content }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
              <i class="fas fa-comment-slash text-3xl text-gray-300 mb-2 block"></i>
              <p class="text-gray-600 text-sm">No comments yet. Be the first to comment!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Comment Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Delete Comment"
      message="Are you sure you want to delete this comment? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDeleteComment"
      @cancel="cancelDeleteComment"
      @close="cancelDeleteComment"
    />
    
    <!-- Notification Modal -->
    <ConfirmationModal
      :show="showNotificationModal"
      title="Notification"
      :message="notificationMessage"
      confirm-text="OK"
      :type="notificationType"
      @confirm="closeNotification"
      @close="closeNotification"
    />
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import api from '../api/axios';
import ConfirmationModal from './ConfirmationModal.vue';

export default {
  name: 'PreviewModal',
  components: {
    ConfirmationModal
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    note: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    console.log('PreviewModal setup - note:', props.note);
    
    const loading = ref(true);
    const error = ref(null);
    const store = useStore();
    const showComments = ref(false);
    const comments = ref([]);
    const newComment = ref('');
    
    // Delete confirmation modal state
    const showDeleteModal = ref(false);
    const commentToDelete = ref(null);
    
    // Notification modal state
    const showNotificationModal = ref(false);
    const notificationMessage = ref('');
    const notificationType = ref('info');
    
    // Authentication state
    const isAuthenticated = computed(() => {
      const auth = store.getters['auth/isAuthenticated'];
      console.log('isAuthenticated:', auth);
      return auth;
    });
    const isApproved = computed(() => {
      const user = store.getters['auth/user'];
      const approved = user?.isApproved || false;
      console.log('isApproved:', approved, 'user:', user);
      return approved;
    });
    
    const previewUrl = computed(() => {
      if (!props.note) return '';
      const url = `/api/notes/${props.note.id}/preview`;
      console.log('Preview URL:', url);
      return url;
    });

    const downloadUrl = computed(() => {
      if (!props.note) return '';
      return `/api/notes/${props.note.id}/download`;
    });

    // Get file extension from filename
    const fileExtension = computed(() => {
      if (!props.note?.fileName) return '';
      const ext = props.note.fileName.split('.').pop().toLowerCase();
      console.log('File extension:', ext, 'from filename:', props.note.fileName);
      return ext;
    });

    const isPDF = computed(() => {
      if (!props.note) return false;
      const result = props.note.fileType === 'application/pdf' || fileExtension.value === 'pdf';
      console.log('Is PDF:', result, 'fileType:', props.note.fileType, 'extension:', fileExtension.value);
      return result;
    });

    const isImage = computed(() => {
      if (!props.note) return false;
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'jfif', 'pjpeg', 'pjp'];
      const result = props.note.fileType.startsWith('image/') || imageExtensions.includes(fileExtension.value);
      console.log('Is Image:', result, 'fileType:', props.note.fileType, 'extension:', fileExtension.value);
      return result;
    });

    const isText = computed(() => {
      if (!props.note) return false;
      const textExtensions = ['txt', 'text', 'log', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'h', 'sql', 'yaml', 'yml', 'ini', 'cfg', 'conf'];
      const result = props.note.fileType === 'text/plain' || 
             props.note.fileType.startsWith('text/') ||
             props.note.fileType === 'application/json' ||
             props.note.fileType === 'application/xml' ||
             textExtensions.includes(fileExtension.value);
      console.log('Is Text:', result, 'fileType:', props.note.fileType, 'extension:', fileExtension.value);
      return result;
    });

    const isOfficeDocument = computed(() => {
      if (!props.note) return false;
      const officeTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      const officeExtensions = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
      const result = officeTypes.includes(props.note.fileType) || officeExtensions.includes(fileExtension.value);
      console.log('Is Office Document:', result, 'fileType:', props.note.fileType, 'extension:', fileExtension.value);
      return result;
    });

    // Google Docs Viewer for Office documents
    const officePreviewUrl = computed(() => {
      if (!props.note) return '';
      const fullUrl = `${window.location.origin}/api/notes/${props.note.id}/preview`;
      return `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    });

    // Determine which preview type to show
    const previewType = computed(() => {
      if (!props.note) return 'none';
      
      if (isPDF.value) {
        console.log('Selected preview type: PDF');
        return 'pdf';
      } else if (isImage.value) {
        console.log('Selected preview type: Image');
        return 'image';
      } else if (isText.value) {
        console.log('Selected preview type: Text');
        return 'text';
      } else if (isOfficeDocument.value) {
        console.log('Selected preview type: Office Document');
        return 'office';
      } else {
        console.log('Selected preview type: Unsupported');
        return 'unsupported';
      }
    });

    const formatFileSize = (bytes) => {
      if (!bytes) return 'Unknown';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Comment methods
    const fetchComments = async () => {
      if (!props.note?.id) return;
      console.log('Fetching comments for note:', props.note.id);
      try {
        const response = await api.get(`/notes/${props.note.id}`);
        console.log('Note details response:', response.data);
        comments.value = response.data.note.comments || [];
        console.log('Comments loaded:', comments.value);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        console.error('Error response:', error.response?.data);
      }
    };

    const handleAddComment = async () => {
      if (!newComment.value.trim() || !props.note?.id) return;

      console.log('Adding comment:', {
        noteId: props.note.id,
        content: newComment.value.trim(),
        user: store.getters['auth/user'],
        isAuthenticated: isAuthenticated.value,
        isApproved: isApproved.value
      });

      try {
        const response = await api.post('/comments', {
          noteId: props.note.id,
          content: newComment.value.trim()
        });
        console.log('Comment added successfully:', response.data);
        newComment.value = '';
        await fetchComments(); // Refresh comments
      } catch (error) {
        console.error('Failed to add comment:', error);
        console.error('Error response:', error.response?.data);
        showNotification('Failed to add comment: ' + (error.response?.data?.message || error.message), 'danger');
      }
    };

    const handleDeleteComment = async (commentId) => {
      // Find the comment to get its details
      const comment = comments.value.find(c => c.id === commentId);
      if (!comment) return;
      
      // Store the comment to delete and show modal
      commentToDelete.value = comment;
      showDeleteModal.value = true;
    };

    const confirmDeleteComment = async () => {
      if (!commentToDelete.value) return;
      
      try {
        await api.delete(`/comments/${commentToDelete.value.id}`);
        await fetchComments(); // Refresh comments
        showDeleteModal.value = false;
        commentToDelete.value = null;
      } catch (error) {
        console.error('Failed to delete comment:', error);
        showNotification('Failed to delete comment', 'danger');
      }
    };

    const cancelDeleteComment = () => {
      showDeleteModal.value = false;
      commentToDelete.value = null;
    };

    // Notification functions
    const showNotification = (message, type = 'info') => {
      notificationMessage.value = message;
      notificationType.value = type;
      showNotificationModal.value = true;
    };

    const closeNotification = () => {
      showNotificationModal.value = false;
      notificationMessage.value = '';
    };

    const canDeleteComment = (comment) => {
      const user = store.getters['auth/user'];
      return user && (comment.userId === user.id || user.role === 'admin');
    };

    const toggleComments = () => {
      showComments.value = !showComments.value;
      if (showComments.value && comments.value.length === 0) {
        fetchComments();
      }
    };

    // Event handlers
    const onIframeError = () => {
      console.log('Iframe failed to load');
      loading.value = false;
      error.value = 'Failed to load preview. The file may be corrupted or in an unsupported format.';
    };

    const onIframeLoad = () => {
      console.log('Iframe loaded successfully');
      loading.value = false;
      error.value = null;
    };

    const onImageLoad = () => {
      console.log('Image loaded successfully');
      loading.value = false;
      error.value = null;
    };

    const onImageError = () => {
      console.log('Image failed to load');
      loading.value = false;
      error.value = 'Failed to load image preview. The file may be corrupted.';
    };

    // Watch for note changes
    watch(() => props.note, (newNote) => {
      if (newNote) {
        console.log('Note changed:', newNote);
        loading.value = true;
        error.value = null;
        
        // Set a timeout to clear loading state if no event fires
        setTimeout(() => {
          if (loading.value) {
            console.log('Timeout reached, clearing loading state - preview should be visible now');
            loading.value = false;
          }
        }, 3000); // 3 second timeout - shorter for better UX
      }
    }, { immediate: true });

    // Watch for modal open/close
    watch(() => props.isOpen, (isOpen) => {
      if (isOpen && props.note) {
        console.log('Modal opened with note:', props.note);
        loading.value = true;
        error.value = null;
      }
    });

    const closeModal = () => {
      emit('close');
    };

    return {
      loading,
      error,
      previewUrl,
      downloadUrl,
      isPDF,
      isImage,
      isText,
      isOfficeDocument,
      officePreviewUrl,
      previewType,
      formatFileSize,
      formatDate,
      onIframeLoad,
      onIframeError,
      onImageLoad,
      onImageError,
      closeModal,
      // Comment-related
      showComments,
      comments,
      newComment,
      isAuthenticated,
      isApproved,
      toggleComments,
      handleAddComment,
      handleDeleteComment,
      confirmDeleteComment,
      cancelDeleteComment,
      canDeleteComment,
      fetchComments,
      showDeleteModal,
      commentToDelete,
      showNotificationModal,
      notificationMessage,
      notificationType,
      closeNotification
    };
  }
};
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 768px) {
  .max-h-\[90vh\] {
    max-height: 95vh;
  }
  iframe.min-h-\[500px\] {
    min-height: 300px;
  }
}
</style>
