<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-5" @click.self="closeModal">
    <div class="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b-2 border-gray-200">
        <div class="flex items-center gap-4">
          <i class="fas fa-eye text-2xl text-primary"></i>
          <h2 class="text-xl font-semibold text-gray-800">Preview: {{ note?.title }}</h2>
        </div>
        <button @click="closeModal" class="text-2xl text-gray-400 hover:text-red-500 transition-colors p-2">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <div class="flex gap-4 items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <span class="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold uppercase rounded-full">
            {{ note?.fileType }}
          </span>
          <span class="text-sm text-gray-600">{{ formatFileSize(note?.fileSize) }}</span>
        </div>

        <div class="flex-1 overflow-auto p-5 flex justify-center items-center">
          <!-- PDF Preview -->
          <iframe
            v-if="isPDF"
            :src="previewUrl"
            class="w-full h-full min-h-[500px] border border-gray-300 rounded-lg"
            frameborder="0"
            title="PDF Preview"
          ></iframe>

          <!-- Image Preview -->
          <img
            v-else-if="isImage"
            :src="previewUrl"
            :alt="note?.title"
            class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />

          <!-- Text File Preview -->
          <iframe
            v-else-if="isText"
            :src="previewUrl"
            class="w-full h-full min-h-[500px] border border-gray-300 rounded-lg"
            frameborder="0"
            title="Text File Preview"
          ></iframe>

          <!-- Office Documents Preview via Google Docs Viewer -->
          <iframe
            v-else-if="isOfficeDocument"
            :src="officePreviewUrl"
            class="w-full h-full min-h-[500px] border border-gray-300 rounded-lg"
            frameborder="0"
            title="Office Document Preview"
          ></iframe>

          <!-- Unsupported File Type -->
          <div v-else class="text-center py-16 px-10">
            <i class="fas fa-file-alt text-8xl text-gray-300 mb-5 block"></i>
            <h3 class="text-2xl font-semibold text-gray-800 mb-4">Preview not available</h3>
            <p class="text-gray-600 mb-2">This file type ({{ note?.fileType }}) cannot be previewed in the browser.</p>
            <p class="text-gray-800 font-semibold mb-5">File: {{ note?.fileName }}</p>
            <a :href="downloadUrl" class="inline-block bg-success hover:bg-success-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              <i class="fas fa-download mr-2"></i> Download File
            </a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-4 p-6 border-t-2 border-gray-200 bg-gray-50">
        <button @click="closeModal" class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
          <i class="fas fa-times mr-2"></i> Close
        </button>
        <a :href="downloadUrl" class="px-6 py-2 bg-success hover:bg-success-dark text-white font-semibold rounded-lg transition-colors">
          <i class="fas fa-download mr-2"></i> Download
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'PreviewModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    note: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const previewUrl = computed(() => {
      if (!props.note) return '';
      return `/api/notes/${props.note.id}/preview`;
    });

    const downloadUrl = computed(() => {
      if (!props.note) return '';
      return `/api/notes/${props.note.id}/download`;
    });

    // Get file extension from filename
    const fileExtension = computed(() => {
      if (!props.note?.fileName) return '';
      return props.note.fileName.split('.').pop().toLowerCase();
    });

    const isPDF = computed(() => {
      if (!props.note) return false;
      return props.note.fileType === 'application/pdf' || fileExtension.value === 'pdf';
    });

    const isImage = computed(() => {
      if (!props.note) return false;
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
      return props.note.fileType.startsWith('image/') || imageExtensions.includes(fileExtension.value);
    });

    const isText = computed(() => {
      if (!props.note) return false;
      const textExtensions = ['txt', 'text', 'log', 'md', 'csv'];
      return props.note.fileType === 'text/plain' || 
             props.note.fileType.startsWith('text/') ||
             textExtensions.includes(fileExtension.value);
    });

    const isOfficeDocument = computed(() => {
      if (!props.note) return false;
      const officeTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      const officeExtensions = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
      return officeTypes.includes(props.note.fileType) || officeExtensions.includes(fileExtension.value);
    });

    // Google Docs Viewer for Office documents
    const officePreviewUrl = computed(() => {
      if (!props.note) return '';
      const fullUrl = `${window.location.origin}/api/notes/${props.note.id}/preview`;
      return `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    });

    const formatFileSize = (bytes) => {
      if (!bytes) return 'Unknown';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const closeModal = () => {
      emit('close');
    };

    return {
      previewUrl,
      downloadUrl,
      isPDF,
      isImage,
      isText,
      isOfficeDocument,
      officePreviewUrl,
      formatFileSize,
      closeModal
    };
  }
};
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 768px) {
  .max-h-\[90vh\] {
    max-height: 95vh;
  }
  iframe.min-h-\[500px\] {
    min-height: 300px;
  }
}
</style>
