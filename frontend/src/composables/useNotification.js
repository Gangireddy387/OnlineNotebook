// Global notification system
import { ref } from 'vue';

const showGlobalNotification = ref(false);
const globalNotification = ref({
  title: '',
  message: '',
  type: 'info'
});

export const useNotification = () => {
  const showToast = (title, message, type = 'info') => {
    globalNotification.value = { title, message, type };
    showGlobalNotification.value = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      showGlobalNotification.value = false;
    }, 5000);
  };

  return {
    showToast,
    showGlobalNotification,
    globalNotification
  };
};
