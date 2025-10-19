<template>
  <div v-if="show" class="fixed top-4 right-4 z-50 max-w-sm w-full">
    <div class="bg-white rounded-lg shadow-lg border-l-4 p-4" :class="borderClass">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i :class="iconClass" class="text-lg"></i>
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium" :class="titleClass">
            {{ title }}
          </p>
          <p v-if="message" class="mt-1 text-sm" :class="messageClass">
            {{ message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="close"
            class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';

export default {
  name: 'NotificationToast',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'success', // success, error, warning, info
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000 // Auto-close after 5 seconds
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const iconClass = computed(() => {
      switch (props.type) {
        case 'error':
          return 'fas fa-exclamation-circle text-red-500';
        case 'warning':
          return 'fas fa-exclamation-triangle text-yellow-500';
        case 'info':
          return 'fas fa-info-circle text-blue-500';
        default:
          return 'fas fa-check-circle text-green-500';
      }
    });

    const borderClass = computed(() => {
      switch (props.type) {
        case 'error':
          return 'border-red-500';
        case 'warning':
          return 'border-yellow-500';
        case 'info':
          return 'border-blue-500';
        default:
          return 'border-green-500';
      }
    });

    const titleClass = computed(() => {
      switch (props.type) {
        case 'error':
          return 'text-red-800';
        case 'warning':
          return 'text-yellow-800';
        case 'info':
          return 'text-blue-800';
        default:
          return 'text-green-800';
      }
    });

    const messageClass = computed(() => {
      switch (props.type) {
        case 'error':
          return 'text-red-600';
        case 'warning':
          return 'text-yellow-600';
        case 'info':
          return 'text-blue-600';
        default:
          return 'text-green-600';
      }
    });

    const close = () => {
      emit('close');
    };

    onMounted(() => {
      if (props.duration > 0) {
        setTimeout(() => {
          close();
        }, props.duration);
      }
    });

    return {
      iconClass,
      borderClass,
      titleClass,
      messageClass,
      close
    };
  }
};
</script>
