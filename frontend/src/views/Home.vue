<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 px-5 text-center">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-6xl font-bold mb-5 animate-fade-in-down">
          <i class="fas fa-graduation-cap text-7xl block mb-5"></i>
          Welcome to Online Notebook
        </h1>
        <p class="text-xl md:text-2xl mb-10 opacity-95 animate-fade-in-up">
          A collaborative platform for BTech and Degree students to share and access educational resources
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <router-link to="/notes" class="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg">
            <i class="fas fa-search mr-2"></i> Browse Notes
          </router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
            <i class="fas fa-user-plus mr-2"></i> Register Now
          </router-link>
          <router-link v-if="isAuthenticated && isApproved" to="/upload" class="bg-success hover:bg-success-dark text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg">
            <i class="fas fa-upload mr-2"></i> Upload Notes
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-5 max-w-7xl mx-auto">
      <h2 class="text-4xl font-bold text-center mb-12 text-gray-800">Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center">
          <div class="text-primary text-5xl mb-5">
            <i class="fas fa-book-open"></i>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-gray-800">Browse Resources</h3>
          <p class="text-gray-600 leading-relaxed">Access notes, PDFs, and documents from various colleges and departments</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center">
          <div class="text-primary text-5xl mb-5">
            <i class="fas fa-filter"></i>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-gray-800">Smart Filtering</h3>
          <p class="text-gray-600 leading-relaxed">Filter content by college, department, and subject for easy discovery</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center">
          <div class="text-primary text-5xl mb-5">
            <i class="fas fa-comments"></i>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-gray-800">Community Discussion</h3>
          <p class="text-gray-600 leading-relaxed">Engage with other students through comments and discussions</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center">
          <div class="text-primary text-5xl mb-5">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-gray-800">Admin Verified</h3>
          <p class="text-gray-600 leading-relaxed">All users are verified by admin to ensure quality content</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center">
          <div class="text-primary text-5xl mb-5">
            <i class="fas fa-download"></i>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-gray-800">Easy Download</h3>
          <p class="text-gray-600 leading-relaxed">Download documents and study materials with a single click</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center">
          <div class="text-primary text-5xl mb-5">
            <i class="fas fa-mobile-alt"></i>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-gray-800">Mobile Friendly</h3>
          <p class="text-gray-600 leading-relaxed">Access your notes anytime, anywhere on any device</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-if="!isAuthenticated" class="bg-gradient-to-r from-pink-500 to-red-500 text-white py-16 px-5 text-center">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-4xl font-bold mb-4">Ready to get started?</h2>
        <p class="text-xl mb-8 opacity-95">Join our community of students and start sharing knowledge today!</p>
        <router-link to="/register" class="inline-block bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg">
          Create Account
        </router-link>
      </div>
    </section>

    <!-- Pending Approval Alert -->
    <section v-if="isAuthenticated && !isApproved" class="max-w-7xl mx-auto px-5 py-8">
      <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-5 flex items-start gap-4">
        <i class="fas fa-hourglass-half text-2xl mt-1"></i>
        <div>
          <strong class="block mb-2 text-lg">Account Pending Approval</strong>
          <p>Your registration is being reviewed by our admin team. You'll be able to upload content and comment once approved.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Home',
  setup() {
    const store = useStore();

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const isApproved = computed(() => store.getters['auth/isApproved']);

    return {
      isAuthenticated,
      isApproved
    };
  }
};
</script>

<style scoped>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.8s ease;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease;
}
</style>
