<template>
  <div class="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <i class="fas fa-upload text-5xl text-primary mb-4 block"></i>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Upload Notes</h2>
          <p class="text-gray-600">Share your study materials with fellow students</p>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-start gap-3">
          <i class="fas fa-check-circle text-xl mt-0.5"></i>
          {{ success }}
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {{ error }}
        </div>

        <!-- Upload Form -->
        <form @submit.prevent="handleUpload" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-heading mr-2 text-primary"></i> Title *
            </label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter note title"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-align-left mr-2 text-primary"></i> Description
            </label>
            <textarea
              v-model="formData.description"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
              placeholder="Describe the content (optional)"
              rows="4"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-university mr-2 text-primary"></i> College
              </label>
              <select v-model="formData.collegeId" @change="onCollegeChange" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                <option value="">Select College (Optional)</option>
                <option v-for="college in colleges" :key="college.id" :value="college.id">
                  {{ college.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-building mr-2 text-primary"></i> Department
              </label>
              <select v-model="formData.departmentId" @change="onDepartmentChange" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                <option value="">Select Department (Optional)</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-book mr-2 text-primary"></i> Subject
            </label>
            <select v-model="formData.subjectId" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
              <option value="">Select Subject (Optional)</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-file mr-2 text-primary"></i> Upload File *
            </label>
            <div 
              @click="triggerFileInput"
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
            >
              <input
                ref="fileInput"
                type="file"
                @change="handleFileChange"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx"
                class="hidden"
                required
              />
              <div v-if="!selectedFile">
                <i class="fas fa-cloud-upload-alt text-5xl text-primary mb-4 block"></i>
                <p class="text-lg font-medium text-gray-800 mb-2">Click to select file or drag and drop</p>
                <span class="text-sm text-gray-500">Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, Images (Max 10MB)</span>
              </div>
              <div v-else class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg" @click.stop>
                <i class="fas fa-file-alt text-4xl text-primary"></i>
                <div class="flex-1 text-left">
                  <strong class="block text-gray-800 mb-1">{{ selectedFile.name }}</strong>
                  <p class="text-sm text-gray-600">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button type="button" @click.stop="removeFile" class="bg-danger hover:bg-danger-dark text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            :disabled="loading || !selectedFile"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-upload mr-2"></i>
            <span>{{ loading ? 'Uploading...' : 'Upload Note' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'Upload',
  setup() {
    const store = useStore();
    const router = useRouter();

    const fileInput = ref(null);
    const selectedFile = ref(null);
    const loading = ref(false);
    const success = ref('');
    const error = ref('');

    const formData = ref({
      title: '',
      description: '',
      collegeId: '',
      departmentId: '',
      subjectId: ''
    });

    const colleges = computed(() => store.getters['notes/colleges']);
    const departments = computed(() => store.getters['notes/departments']);
    const subjects = computed(() => store.getters['notes/subjects']);

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          error.value = 'File size must be less than 10MB';
          return;
        }
        selectedFile.value = file;
        error.value = '';
      }
    };

    const removeFile = () => {
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const onCollegeChange = () => {
      formData.value.departmentId = '';
      formData.value.subjectId = '';
      if (formData.value.collegeId) {
        store.dispatch('notes/fetchDepartments', formData.value.collegeId);
      }
    };

    const onDepartmentChange = () => {
      formData.value.subjectId = '';
      if (formData.value.departmentId) {
        store.dispatch('notes/fetchSubjects', formData.value.departmentId);
      }
    };

    const handleUpload = async () => {
      if (!selectedFile.value) {
        error.value = 'Please select a file';
        return;
      }

      loading.value = true;
      error.value = '';
      success.value = '';

      try {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile.value);
        uploadData.append('title', formData.value.title);
        uploadData.append('description', formData.value.description);
        if (formData.value.collegeId) uploadData.append('collegeId', formData.value.collegeId);
        if (formData.value.departmentId) uploadData.append('departmentId', formData.value.departmentId);
        if (formData.value.subjectId) uploadData.append('subjectId', formData.value.subjectId);

        await store.dispatch('notes/uploadNote', uploadData);

        success.value = 'Note uploaded successfully!';
        
        // Reset form
        formData.value = {
          title: '',
          description: '',
          collegeId: '',
          departmentId: '',
          subjectId: ''
        };
        removeFile();

        // Redirect to notes page after 2 seconds
        setTimeout(() => {
          router.push('/notes');
        }, 2000);
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to upload note';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      store.dispatch('notes/fetchColleges');
      store.dispatch('notes/fetchDepartments');
      store.dispatch('notes/fetchSubjects');
    });

    return {
      fileInput,
      selectedFile,
      loading,
      success,
      error,
      formData,
      colleges,
      departments,
      subjects,
      triggerFileInput,
      handleFileChange,
      removeFile,
      formatFileSize,
      onCollegeChange,
      onDepartmentChange,
      handleUpload
    };
  }
};
</script>
