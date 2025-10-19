<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <i class="fas fa-sign-in-alt text-5xl text-primary mb-4 block"></i>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Login to Your Account</h2>
          <p class="text-gray-600">Welcome back! Please login to continue.</p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {{ error }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-envelope mr-2 text-primary"></i> Email
            </label>
            <input
              v-model="formData.email"
              type="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-lock mr-2 text-primary"></i> Password
            </label>
            <input
              v-model="formData.password"
              type="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-6 pt-6 border-t border-gray-200 text-center">
          <p class="text-gray-600">
            Don't have an account? 
            <router-link to="/register" class="text-primary font-semibold hover:underline">
              Register here
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
import { useRouter } from 'vue-router';

export default {
  name: 'Login',
  setup() {
    const store = useStore();
    const router = useRouter();

    const formData = ref({
      email: '',
      password: ''
    });

    const loading = computed(() => store.getters['auth/loading']);
    const error = computed(() => store.getters['auth/error']);

    const handleLogin = async () => {
      try {
        await store.dispatch('auth/login', formData.value);
        router.push('/');
      } catch (err) {
        console.error('Login error:', err);
      }
    };

    return {
      formData,
      loading,
      error,
      handleLogin
    };
  }
};
</script>
