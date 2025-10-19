import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';

const app = createApp(App);

// Load user data on app initialization
store.dispatch('auth/loadUser').then(() => {
  app.use(store).use(router).mount('#app');
}).catch(() => {
  // If loading user fails, still mount the app
  app.use(store).use(router).mount('#app');
});

