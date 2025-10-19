<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-xl text-primary font-semibold">Loading note details...</p>
      </div>

      <!-- Note Content -->
      <div v-else-if="note" class="space-y-6">
        <!-- Main Note Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 md:p-8 text-white">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div class="flex-1">
                <h1 class="text-3xl md:text-4xl font-bold mb-3">{{ note.title }}</h1>
                <span class="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold uppercase rounded-full">
                  {{ note.fileType }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button @click="openPreview" class="bg-white hover:bg-gray-100 text-indigo-600 font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-md">
                  <i class="fas fa-eye"></i>
                  <span>Preview</span>
                </button>
                <a :href="`/api/notes/${note.id}/download`" class="bg-success hover:bg-success-dark text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-md">
                  <i class="fas fa-download"></i>
                  <span>Download</span>
                </a>
                <button
                  v-if="canDelete"
                  @click="handleDelete"
                  class="bg-danger hover:bg-danger-dark text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-md"
                >
                  <i class="fas fa-trash"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8">
            <!-- Info Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div class="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <i class="fas fa-user text-2xl text-blue-600 mt-1"></i>
                <div>
                  <strong class="block text-sm text-blue-900 mb-1">Uploaded by:</strong>
                  <p class="text-gray-800 font-semibold">{{ note.user?.name }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <i class="fas fa-calendar text-2xl text-purple-600 mt-1"></i>
                <div>
                  <strong class="block text-sm text-purple-900 mb-1">Upload Date:</strong>
                  <p class="text-gray-800 font-semibold">{{ formatDate(note.createdAt) }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <i class="fas fa-download text-2xl text-green-600 mt-1"></i>
                <div>
                  <strong class="block text-sm text-green-900 mb-1">Downloads:</strong>
                  <p class="text-gray-800 font-semibold">{{ note.downloads }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <i class="fas fa-file text-2xl text-orange-600 mt-1"></i>
                <div>
                  <strong class="block text-sm text-orange-900 mb-1">File Size:</strong>
                  <p class="text-gray-800 font-semibold">{{ formatFileSize(note.fileSize) }}</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="note.description" class="mb-6 p-6 bg-gray-50 rounded-xl">
              <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <i class="fas fa-align-left text-primary"></i>
                <span>Description</span>
              </h3>
              <p class="text-gray-700 leading-relaxed">{{ note.description }}</p>
            </div>

            <!-- Categories -->
            <div class="flex flex-wrap gap-3">
              <div v-if="note.college" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md">
                <i class="fas fa-university"></i>
                <span>{{ note.college.name }}</span>
              </div>
              <div v-if="note.department" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-md">
                <i class="fas fa-building"></i>
                <span>{{ note.department.name }}</span>
              </div>
              <div v-if="note.subject" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-md">
                <i class="fas fa-book"></i>
                <span>{{ note.subject.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <i class="fas fa-comments text-primary"></i>
            <span>Comments ({{ note.comments?.length || 0 }})</span>
          </h2>

          <!-- Add Comment Form -->
          <div v-if="isAuthenticated && isApproved" class="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <textarea
              v-model="newComment"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none mb-4"
              placeholder="Write your comment here..."
              rows="3"
            ></textarea>
            <button 
              @click="handleAddComment" 
              class="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="!newComment.trim()"
            >
              <i class="fas fa-paper-plane"></i>
              <span>Post Comment</span>
            </button>
          </div>

          <div v-else-if="isAuthenticated && !isApproved" class="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
            You need admin approval to post comments.
          </div>

          <div v-else class="mb-6 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
            Please <router-link to="/login" class="font-semibold underline">login</router-link> to post comments.
          </div>

          <!-- Comments List -->
          <div class="space-y-4">
            <div v-if="note.comments && note.comments.length > 0">
              <div v-for="comment in note.comments" :key="comment.id" class="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <i class="fas fa-user-circle text-3xl text-primary"></i>
                    <div>
                      <strong class="block text-gray-800 font-semibold">{{ comment.user?.name }}</strong>
                      <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                  </div>
                  <button
                    v-if="canDeleteComment(comment)"
                    @click="handleDeleteComment(comment.id)"
                    class="text-danger hover:text-danger-dark transition-colors p-2"
                    title="Delete comment"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <p class="text-gray-700 leading-relaxed pl-11">{{ comment.content }}</p>
              </div>
            </div>
            <div v-else class="text-center py-12 bg-gray-50 rounded-xl">
              <i class="fas fa-comment-slash text-5xl text-gray-300 mb-3 block"></i>
              <p class="text-gray-600 text-lg">No comments yet. Be the first to comment!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-else class="text-center py-20 bg-white rounded-2xl shadow-md">
        <i class="fas fa-exclamation-triangle text-6xl text-danger mb-5 block"></i>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Note not found</h2>
        <router-link to="/notes" class="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          Back to Notes
        </router-link>
      </div>
    </div>

    <!-- Preview Modal -->
    <PreviewModal :isOpen="showPreview" :note="note" @close="closePreview" />
    
    <!-- Delete Note Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteNoteModal"
      title="Delete Note"
      message="Are you sure you want to delete this note? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDeleteNote"
      @cancel="cancelDeleteNote"
      @close="cancelDeleteNote"
    />
    
    <!-- Delete Comment Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteCommentModal"
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
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import PreviewModal from '../components/PreviewModal.vue';
import ConfirmationModal from '../components/ConfirmationModal.vue';

export default {
  name: 'NoteDetail',
  components: {
    PreviewModal,
    ConfirmationModal
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const newComment = ref('');
    const showPreview = ref(false);
    
    // Modal states
    const showDeleteNoteModal = ref(false);
    const showDeleteCommentModal = ref(false);
    const showNotificationModal = ref(false);
    const commentToDelete = ref(null);
    const notificationMessage = ref('');
    const notificationType = ref('info');

    const note = computed(() => store.getters['notes/currentNote']);
    const loading = computed(() => store.getters['notes/loading']);
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const isApproved = computed(() => store.getters['auth/isApproved']);
    const user = computed(() => store.getters['auth/user']);

    const canDelete = computed(() => {
      return user.value && (user.value.id === note.value?.userId || user.value.role === 'admin');
    });

    const canDeleteComment = (comment) => {
      return user.value && (user.value.id === comment.userId || user.value.role === 'admin');
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleAddComment = async () => {
      if (!newComment.value.trim()) return;

      try {
        await store.dispatch('notes/addComment', {
          noteId: route.params.id,
          content: newComment.value
        });
        newComment.value = '';
        // Reload note to show new comment
        await store.dispatch('notes/fetchNote', route.params.id);
      } catch (error) {
        showNotification('Failed to add comment', 'danger');
      }
    };

    const handleDelete = async () => {
      showDeleteNoteModal.value = true;
    };

    const confirmDeleteNote = async () => {
      try {
        await store.dispatch('notes/deleteNote', note.value.id);
        router.push('/notes');
      } catch (error) {
        showNotification('Failed to delete note', 'danger');
      }
      showDeleteNoteModal.value = false;
    };

    const cancelDeleteNote = () => {
      showDeleteNoteModal.value = false;
    };

    const handleDeleteComment = async (commentId) => {
      // Find the comment to get its details
      const comment = note.value.comments.find(c => c.id === commentId);
      if (!comment) return;
      
      commentToDelete.value = comment;
      showDeleteCommentModal.value = true;
    };

    const confirmDeleteComment = async () => {
      try {
        await store.dispatch('notes/deleteComment', commentToDelete.value.id);
        // Reload note to update comments
        await store.dispatch('notes/fetchNote', route.params.id);
      } catch (error) {
        showNotification('Failed to delete comment', 'danger');
      }
      showDeleteCommentModal.value = false;
      commentToDelete.value = null;
    };

    const cancelDeleteComment = () => {
      showDeleteCommentModal.value = false;
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

    const openPreview = () => {
      showPreview.value = true;
    };

    const closePreview = () => {
      showPreview.value = false;
    };

    onMounted(() => {
      store.dispatch('notes/fetchNote', route.params.id);
    });

    return {
      note,
      loading,
      isAuthenticated,
      isApproved,
      canDelete,
      canDeleteComment,
      newComment,
      showPreview,
      formatDate,
      formatFileSize,
      handleAddComment,
      handleDelete,
      handleDeleteComment,
      confirmDeleteNote,
      cancelDeleteNote,
      confirmDeleteComment,
      cancelDeleteComment,
      openPreview,
      closePreview,
      showDeleteNoteModal,
      showDeleteCommentModal,
      showNotificationModal,
      notificationMessage,
      notificationType,
      closeNotification
    };
  }
};
</script>
