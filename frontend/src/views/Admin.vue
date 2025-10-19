<template>
  <div class="py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-3">
          <i class="fas fa-shield-alt mr-3"></i> Admin Dashboard
        </h1>
        <p class="text-lg text-gray-600">Manage user registrations and monitor platform activity</p>
      </div>

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
              <button @click="handleApprove(user.id)" class="flex-1 bg-success hover:bg-success-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                <i class="fas fa-check mr-2"></i> Approve
              </button>
              <button @click="handleReject(user.id)" class="flex-1 bg-danger hover:bg-danger-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                <i class="fas fa-times mr-2"></i> Reject
              </button>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'Admin',
  setup() {
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

    const handleApprove = async (userId) => {
      if (confirm('Are you sure you want to approve this user?')) {
        try {
          await axios.put(`/api/admin/approve-user/${userId}`);
          alert('User approved successfully!');
          fetchPendingUsers();
          fetchStats();
        } catch (error) {
          alert('Failed to approve user');
        }
      }
    };

    const handleReject = async (userId) => {
      if (confirm('Are you sure you want to reject and delete this user registration?')) {
        try {
          await axios.delete(`/api/admin/reject-user/${userId}`);
          alert('User registration rejected');
          fetchPendingUsers();
          fetchStats();
        } catch (error) {
          alert('Failed to reject user');
        }
      }
    };

    onMounted(() => {
      fetchStats();
      fetchPendingUsers();
      fetchAllUsers();
    });

    return {
      activeTab,
      loading,
      pendingUsers,
      allUsers,
      stats,
      formatDate,
      handleApprove,
      handleReject
    };
  }
};
</script>
