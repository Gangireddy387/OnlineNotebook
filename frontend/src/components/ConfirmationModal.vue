<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

      <!-- Modal -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl" @click.stop>
        <!-- Icon -->
        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full" :class="iconBgClass">
          <i :class="iconClass" class="text-2xl"></i>
        </div>

        <!-- Title -->
        <h3 class="text-lg font-medium leading-6 text-gray-900 text-center mb-2">
          {{ title }}
        </h3>

        <!-- Message -->
        <div class="mt-2">
          <p class="text-sm text-gray-500 text-center">
            {{ message }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-6">
          <button
            @click="handleCancel"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleConfirm"
            class="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            :class="confirmButtonClass"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ConfirmationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm Action'
    },
    message: {
      type: String,
      default: 'Are you sure you want to proceed?'
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    type: {
      type: String,
      default: 'warning', // warning, danger, success, info
      validator: (value) => ['warning', 'danger', 'success', 'info'].includes(value)
    }
  },
  emits: ['confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    const iconClass = computed(() => {
      switch (props.type) {
        case 'danger':
          return 'fas fa-exclamation-triangle text-red-600';
        case 'success':
          return 'fas fa-check-circle text-green-600';
        case 'info':
          return 'fas fa-info-circle text-blue-600';
        default:
          return 'fas fa-question-circle text-yellow-600';
      }
    });

    const iconBgClass = computed(() => {
      switch (props.type) {
        case 'danger':
          return 'bg-red-100';
        case 'success':
          return 'bg-green-100';
        case 'info':
          return 'bg-blue-100';
        default:
          return 'bg-yellow-100';
      }
    });

    const confirmButtonClass = computed(() => {
      switch (props.type) {
        case 'danger':
          return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
        case 'success':
          return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
        case 'info':
          return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        default:
          return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      }
    });

    const handleConfirm = () => {
      emit('confirm');
    };

    const handleCancel = () => {
      emit('cancel');
    };

    const handleBackdropClick = () => {
      emit('close');
    };

    return {
      iconClass,
      iconBgClass,
      confirmButtonClass,
      handleConfirm,
      handleCancel,
      handleBackdropClick
    };
  }
};
</script>
