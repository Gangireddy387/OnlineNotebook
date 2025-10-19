<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <router-link to="/" class="flex items-center gap-3 text-white text-2xl font-bold hover:opacity-90 transition-opacity">
          <i class="fas fa-book text-3xl"></i>
          <span>Online Notebook</span>
        </router-link>
        
        <div class="hidden md:flex items-center gap-2" :class="{ 'flex': mobileMenuOpen }">
          <router-link to="/" class="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">
            Home
          </router-link>
          <router-link to="/notes" class="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">
            Browse Notes
          </router-link>
          
          <template v-if="isAuthenticated">
            <router-link v-if="isApproved" to="/upload" class="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">
              Upload
            </router-link>
            <router-link v-if="isApproved" to="/chat" class="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">
              Chat
            </router-link>
            <router-link v-if="isAdmin" to="/admin" class="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">
              Admin
            </router-link>
            <router-link to="/profile" class="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">
              Profile
            </router-link>
            <button @click="handleLogout" class="text-white px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium">
              Logout
            </button>
          </template>
          
          <template v-else>
            <router-link to="/login" class="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">
              Login
            </router-link>
            <router-link to="/register" class="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Register
            </router-link>
          </template>
        </div>

        <button class="md:hidden flex flex-col gap-1.5 p-2" @click="toggleMobileMenu">
          <span class="w-6 h-0.5 bg-white rounded transition-all"></span>
          <span class="w-6 h-0.5 bg-white rounded transition-all"></span>
          <span class="w-6 h-0.5 bg-white rounded transition-all"></span>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4 flex flex-col gap-2">
        <router-link to="/" class="text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-center">
          Home
        </router-link>
        <router-link to="/notes" class="text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-center">
          Browse Notes
        </router-link>
        
        <template v-if="isAuthenticated">
          <router-link v-if="isApproved" to="/upload" class="text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-center">
            Upload
          </router-link>
          <router-link v-if="isApproved" to="/chat" class="text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-center">
            Chat
          </router-link>
          <router-link v-if="isAdmin" to="/admin" class="text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-center">
            Admin
          </router-link>
          <router-link to="/profile" class="text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-center">
            Profile
          </router-link>
          <button @click="handleLogout" class="text-white px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium">
            Logout
          </button>
        </template>
        
        <template v-else>
          <router-link to="/login" class="text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-center">
            Login
          </router-link>
          <router-link to="/register" class="bg-white text-indigo-600 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-center">
            Register
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'Navbar',
  setup() {
    const store = useStore();
    const router = useRouter();
    const mobileMenuOpen = ref(false);

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const isAdmin = computed(() => store.getters['auth/isAdmin']);
    const isApproved = computed(() => store.getters['auth/isApproved']);

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    const handleLogout = () => {
      store.dispatch('auth/logout');
      router.push('/');
      mobileMenuOpen.value = false;
    };

    return {
      isAuthenticated,
      isAdmin,
      isApproved,
      mobileMenuOpen,
      toggleMobileMenu,
      handleLogout
    };
  }
};
</script>

<style scoped>
/* No custom styles needed - using Tailwind CSS */
</style>

