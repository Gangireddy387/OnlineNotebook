<template>
  <div class="py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Custom Confirmation Modal -->
      <ConfirmationModal
        :show="showConfirmModal"
        :title="confirmModal.title"
        :message="confirmModal.message"
        :type="confirmModal.type"
        :confirm-text="confirmModal.confirmText"
        :cancel-text="confirmModal.cancelText"
        @confirm="handleConfirmAction"
        @cancel="handleCancelAction"
        @close="handleCancelAction"
      />

      <!-- Notification Toast -->
      <NotificationToast
        :show="showNotification"
        :title="notification.title"
        :message="notification.message"
        :type="notification.type"
        @close="showNotification = false"
      />
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-3">
          <i class="fas fa-shield-alt mr-3"></i> Admin Dashboard
        </h1>
        <p class="text-lg text-gray-600">Manage user registrations and monitor platform activity</p>
      </div>

      <!-- Loading State -->
      <div v-if="!isUserLoaded" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">Loading user data...</p>
      </div>

      <!-- Admin Content -->
      <div v-else-if="isAdmin">
        <!-- Statistics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          <div class="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div class="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white text-2xl">
              <i class="fas fa-users"></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalUsers || 0 }}</h3>
              <p class="text-sm text-gray-600">Total Users</p>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div class="w-14 h-14 bg-warning rounded-xl flex items-center justify-center text-white text-2xl">
              <i class="fas fa-clock"></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ stats.pendingUsers || 0 }}</h3>
              <p class="text-sm text-gray-600">Pending Approvals</p>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div class="w-14 h-14 bg-success rounded-xl flex items-center justify-center text-white text-2xl">
              <i class="fas fa-check-circle"></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ stats.approvedUsers || 0 }}</h3>
              <p class="text-sm text-gray-600">Approved Users</p>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div class="w-14 h-14 bg-danger rounded-xl flex items-center justify-center text-white text-2xl">
              <i class="fas fa-book"></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalNotes || 0 }}</h3>
              <p class="text-sm text-gray-600">Total Notes</p>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div class="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
              <i class="fas fa-comments"></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalComments || 0 }}</h3>
              <p class="text-sm text-gray-600">Total Comments</p>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div class="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center text-white text-2xl">
              <i class="fas fa-download"></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalDownloads || 0 }}</h3>
              <p class="text-sm text-gray-600">Total Downloads</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-8 border-b-2 border-gray-200">
          <button
            :class="['px-6 py-3 font-semibold transition-colors border-b-3', activeTab === 'pending' ? 'text-primary border-primary' : 'text-gray-600 border-transparent hover:text-primary']"
            @click="activeTab = 'pending'"
          >
            <i class="fas fa-hourglass-half mr-2"></i>
            Pending Users ({{ pendingUsers.length }})
          </button>
          <button
            :class="['px-6 py-3 font-semibold transition-colors border-b-3', activeTab === 'all' ? 'text-primary border-primary' : 'text-gray-600 border-transparent hover:text-primary']"
            @click="activeTab = 'all'"
          >
            <i class="fas fa-users mr-2"></i>
            All Users
          </button>
        </div>

      <!-- Pending Users Tab -->
      <div v-if="activeTab === 'pending'">
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-lg text-gray-600">Loading...</p>
        </div>

        <div v-else-if="pendingUsers.length === 0" class="text-center py-20">
          <i class="fas fa-check-circle text-6xl text-success mb-5 block"></i>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">No Pending Approvals</h3>
          <p class="text-gray-600">All user registrations have been processed.</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="user in pendingUsers" :key="user.id" class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center gap-4 pb-4 mb-4 border-b border-gray-200">
              <i class="fas fa-user-circle text-5xl text-primary"></i>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-800 mb-2">{{ user.name }}</h3>
                <span class="inline-block px-3 py-1 bg-warning text-white text-xs font-semibold uppercase rounded-full">Pending</span>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <i class="fas fa-envelope text-primary w-5"></i>
                <span>{{ user.email }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <i class="fas fa-phone text-primary w-5"></i>
                <span>{{ user.phone || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <i class="fas fa-university text-primary w-5"></i>
                <span>{{ user.college?.name || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <i class="fas fa-building text-primary w-5"></i>
                <span>{{ user.department?.name || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <i class="fas fa-graduation-cap text-primary w-5"></i>
                <span>{{ user.year || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <i class="fas fa-id-card text-primary w-5"></i>
                <span>{{ user.rollNumber || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <i class="fas fa-calendar text-primary w-5"></i>
                <span>Registered: {{ formatDate(user.createdAt) }}</span>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                v-if="canApprove"
                @click="handleApprove(user.id)" 
                class="flex-1 bg-success hover:bg-success-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <i class="fas fa-check mr-2"></i> Approve
              </button>
              <button 
                v-if="canApprove"
                @click="handleReject(user.id)" 
                class="flex-1 bg-danger hover:bg-danger-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <i class="fas fa-times mr-2"></i> Reject
              </button>
              <div v-if="!canApprove" class="flex-1 text-center py-2 px-4 text-gray-500 text-sm">
                <i class="fas fa-info-circle mr-2"></i> Only admins can approve users
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Users Tab -->
      <div v-if="activeTab === 'all'">
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-lg text-gray-600">Loading...</p>
        </div>

        <div v-else-if="allUsers.length === 0" class="text-center py-20">
          <i class="fas fa-users-slash text-6xl text-gray-400 mb-5 block"></i>
          <h3 class="text-2xl font-bold text-gray-800">No Users Found</h3>
        </div>

        <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-primary text-white">
                <tr>
                  <th class="px-6 py-4 text-left font-semibold">Name</th>
                  <th class="px-6 py-4 text-left font-semibold">Email</th>
                  <th class="px-6 py-4 text-left font-semibold">College</th>
                  <th class="px-6 py-4 text-left font-semibold">Department</th>
                  <th class="px-6 py-4 text-left font-semibold">Status</th>
                  <th class="px-6 py-4 text-left font-semibold">Role</th>
                  <th class="px-6 py-4 text-left font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in allUsers" :key="user.id" class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">{{ user.name }}</td>
                  <td class="px-6 py-4">{{ user.email }}</td>
                  <td class="px-6 py-4">{{ user.college?.name || 'N/A' }}</td>
                  <td class="px-6 py-4">{{ user.department?.name || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span v-if="user.isApproved" class="inline-block px-3 py-1 bg-success text-white text-xs font-semibold uppercase rounded-full">Approved</span>
                    <span v-else class="inline-block px-3 py-1 bg-warning text-white text-xs font-semibold uppercase rounded-full">Pending</span>
                  </td>
                  <td class="px-6 py-4">
                    <span v-if="user.role === 'admin'" class="inline-block px-3 py-1 bg-danger text-white text-xs font-semibold uppercase rounded-full">Admin</span>
                    <span v-else class="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold uppercase rounded-full">User</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(user.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Access Denied Message -->
    <div v-else class="text-center py-16">
      <div class="max-w-md mx-auto">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-exclamation-triangle text-3xl text-red-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p class="text-gray-600 mb-6">Only administrators can access this area.</p>
        <router-link to="/" class="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
          <i class="fas fa-home mr-2"></i>
          Go to Home
        </router-link>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal.vue';
import NotificationToast from '../components/NotificationToast.vue';
import { useStore } from 'vuex';

export default {
  name: 'Admin',
  components: {
    ConfirmationModal,
    NotificationToast
  },
  setup() {
    const store = useStore();
    const activeTab = ref('pending');
    const loading = ref(false);
    const pendingUsers = ref([]);
    const allUsers = ref([]);
    const stats = ref({
      totalUsers: 0,
      pendingUsers: 0,
      approvedUsers: 0,
      totalNotes: 0,
      totalComments: 0,
      totalDownloads: 0
    });

    // Check if current user can approve (only super_admin and admin)
    const canApprove = computed(() => {
      const user = store.getters['auth/user'];
      return user?.role === 'super_admin' || user?.role === 'admin';
    });

    // Check if user data is loaded
    const isUserLoaded = computed(() => {
      return !!store.getters['auth/user'];
    });

    // Check if user is admin
    const isAdmin = computed(() => {
      const user = store.getters['auth/user'];
      return user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'moderator';
    });

    // Modal state
    const showConfirmModal = ref(false);
    const confirmModal = ref({
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    });
    const pendingAction = ref(null);

    // Notification state
    const showNotification = ref(false);
    const notification = ref({
      title: '',
      message: '',
      type: 'success'
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        stats.value = response.data.stats;
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchPendingUsers = async () => {
      try {
        loading.value = true;
        const response = await axios.get('/api/admin/pending-users');
        pendingUsers.value = response.data.users;
        loading.value = false;
      } catch (error) {
        console.error('Error fetching pending users:', error);
        loading.value = false;
      }
    };

    const fetchAllUsers = async () => {
      try {
        loading.value = true;
        const response = await axios.get('/api/admin/users');
        allUsers.value = response.data.users;
        loading.value = false;
      } catch (error) {
        console.error('Error fetching all users:', error);
        loading.value = false;
      }
    };

    // Show notification
    const showToast = (title, message, type = 'success') => {
      notification.value = { title, message, type };
      showNotification.value = true;
    };

    // Show confirmation modal
    const showConfirm = (title, message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel') => {
      confirmModal.value = { title, message, type, confirmText, cancelText };
      showConfirmModal.value = true;
    };

    // Handle modal confirmation
    const handleConfirmAction = async () => {
      showConfirmModal.value = false;
      
      if (pendingAction.value) {
        const { action, userId } = pendingAction.value;
        pendingAction.value = null;
        
        try {
          if (action === 'approve') {
            await axios.put(`/api/admin/approve-user/${userId}`);
            showToast('Success!', 'User approved successfully!', 'success');
            fetchPendingUsers();
            fetchStats();
          } else if (action === 'reject') {
            await axios.delete(`/api/admin/reject-user/${userId}`);
            showToast('Success!', 'User registration rejected', 'success');
            fetchPendingUsers();
            fetchStats();
          }
        } catch (error) {
          showToast('Error!', `Failed to ${action} user`, 'error');
        }
      }
    };

    // Handle modal cancellation
    const handleCancelAction = () => {
      showConfirmModal.value = false;
      pendingAction.value = null;
    };

    const handleApprove = (userId) => {
      pendingAction.value = { action: 'approve', userId };
      showConfirm(
        'Approve User',
        'Are you sure you want to approve this user? They will be able to access all platform features.',
        'success',
        'Approve',
        'Cancel'
      );
    };

    const handleReject = (userId) => {
      pendingAction.value = { action: 'reject', userId };
      showConfirm(
        'Reject User',
        'Are you sure you want to reject and delete this user registration? This action cannot be undone.',
        'danger',
        'Reject',
        'Cancel'
      );
    };

    onMounted(() => {
      // Only load data if user is admin
      if (isAdmin.value) {
        fetchStats();
        fetchPendingUsers();
        fetchAllUsers();
      }
    });

    return {
      activeTab,
      loading,
      pendingUsers,
      allUsers,
      stats,
      formatDate,
      handleApprove,
      handleReject,
      canApprove,
      isUserLoaded,
      isAdmin,
      // Modal state
      showConfirmModal,
      confirmModal,
      handleConfirmAction,
      handleCancelAction,
      // Notification state
      showNotification,
      notification
    };
  }
};
</script>
