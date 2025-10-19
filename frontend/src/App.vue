<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
    
    <!-- Global Notification Toast -->
    <NotificationToast
      :show="showGlobalNotification"
      :title="globalNotification.title"
      :message="globalNotification.message"
      :type="globalNotification.type"
      @close="showGlobalNotification = false"
    />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import NotificationToast from './components/NotificationToast.vue';
import { useNotification } from './composables/useNotification';

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    NotificationToast
  },
  setup() {
    const { showGlobalNotification, globalNotification } = useNotification();
    
    return {
      showGlobalNotification,
      globalNotification
    };
  },
  mounted() {
    // Check if user is logged in on app load
    if (localStorage.getItem('token')) {
      this.$store.dispatch('auth/loadUser');
    }
  }
};
</script>

<style>
body {
  @apply bg-gray-50 text-gray-800;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  @apply min-h-screen flex flex-col;
}

.main-content {
  @apply flex-1 pt-20;
}
</style>

