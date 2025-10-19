<template>
  <div class="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-6">
        <!-- Profile Header -->
        <div class="text-center mb-8 pb-8 border-b border-gray-200">
          <div class="inline-block mb-4">
            <i class="fas fa-user-circle text-8xl text-primary"></i>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-3">{{ user?.name }}</h2>
          <span v-if="user?.role === 'admin'" class="inline-block px-4 py-1 bg-danger text-white text-sm font-semibold uppercase rounded-full">
            Admin
          </span>
          <span v-else-if="user?.isApproved" class="inline-block px-4 py-1 bg-success text-white text-sm font-semibold uppercase rounded-full">
            Approved
          </span>
          <span v-else class="inline-block px-4 py-1 bg-warning text-white text-sm font-semibold uppercase rounded-full">
            Pending Approval
          </span>
        </div>

        <!-- Profile Information -->
        <div class="space-y-4 mb-8">
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-primary text-2xl w-10">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-600 font-medium">Email</div>
              <div class="text-gray-800 font-semibold">{{ user?.email }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-primary text-2xl w-10">
              <i class="fas fa-phone"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-600 font-medium">Phone</div>
              <div class="text-gray-800 font-semibold">{{ user?.phone || 'Not provided' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-primary text-2xl w-10">
              <i class="fas fa-university"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-600 font-medium">College</div>
              <div class="text-gray-800 font-semibold">{{ user?.college?.name || 'Not provided' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-primary text-2xl w-10">
              <i class="fas fa-building"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-600 font-medium">Department</div>
              <div class="text-gray-800 font-semibold">{{ user?.department?.name || 'Not provided' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-primary text-2xl w-10">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-600 font-medium">Year</div>
              <div class="text-gray-800 font-semibold">{{ user?.year || 'Not provided' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-primary text-2xl w-10">
              <i class="fas fa-id-card"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-600 font-medium">Roll Number</div>
              <div class="text-gray-800 font-semibold">{{ user?.rollNumber || 'Not provided' }}</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 flex-wrap">
          <router-link v-if="user?.isApproved" to="/upload" class="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
            <i class="fas fa-upload mr-2"></i> Upload Notes
          </router-link>
          <router-link to="/notes" class="flex-1 bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
            <i class="fas fa-book mr-2"></i> Browse Notes
          </router-link>
        </div>
      </div>

      <!-- Pending Approval Card -->
      <div v-if="!user?.isApproved && user?.role !== 'admin'" class="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-md p-8 text-center">
        <div class="text-yellow-600 text-6xl mb-5">
          <i class="fas fa-hourglass-half"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-3">Account Pending Approval</h3>
        <p class="text-gray-700 leading-relaxed">
          Your registration is being reviewed by our admin team. You'll receive full access once your account is approved. This helps us maintain a quality learning environment.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Profile',
  setup() {
    const store = useStore();

    const user = computed(() => store.getters['auth/user']);

    return {
      user
    };
  }
};
</script>
