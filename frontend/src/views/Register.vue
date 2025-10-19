<template>
  <div class="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <i class="fas fa-user-plus text-5xl text-primary mb-4 block"></i>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
          <p class="text-gray-600">Join our community and start sharing knowledge!</p>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-start gap-3">
          <i class="fas fa-check-circle text-xl mt-0.5"></i>
          <div>
            {{ success }}
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {{ error }}
        </div>

        <!-- Registration Form -->
        <form v-if="!success" @submit.prevent="handleRegister" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
              <input
                v-model="formData.password"
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Minimum 6 characters"
                required
                minlength="6"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">College Name *</label>
              <input
                v-model="formData.collegeName"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your college name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
              <input
                v-model="formData.department"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="e.g., Computer Science"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Year/Semester</label>
              <input
                v-model="formData.year"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="e.g., 3rd Year"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
              <input
                v-model="formData.rollNumber"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your roll number"
              />
            </div>
          </div>

          <button 
            type="submit" 
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <span>{{ loading ? 'Registering...' : 'Register' }}</span>
          </button>
        </form>

        <!-- Success Actions -->
        <div v-if="success" class="mt-6">
          <router-link to="/login" class="block w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg text-center transition-all">
            Go to Login
          </router-link>
        </div>

        <!-- Footer -->
        <div class="mt-6 pt-6 border-t border-gray-200 text-center">
          <p class="text-gray-600">
            Already have an account? 
            <router-link to="/login" class="text-primary font-semibold hover:underline">
              Login here
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Register',
  setup() {
    const store = useStore();

    const formData = ref({
      name: '',
      email: '',
      password: '',
      phone: '',
      collegeName: '',
      department: '',
      year: '',
      rollNumber: ''
    });

    const success = ref('');
    const error = ref('');

    const loading = computed(() => store.getters['auth/loading']);

    const handleRegister = async () => {
      try {
        error.value = '';
        const response = await store.dispatch('auth/register', formData.value);
        success.value = response.message;
        
        // Reset form
        formData.value = {
          name: '',
          email: '',
          password: '',
          phone: '',
          collegeName: '',
          department: '',
          year: '',
          rollNumber: ''
        };
      } catch (err) {
        error.value = err.response?.data?.message || 'Registration failed';
      }
    };

    return {
      formData,
      loading,
      success,
      error,
      handleRegister
    };
  }
};
</script>
