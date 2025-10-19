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

        <!-- Subject Creation Modal -->
        <div v-if="showSubjectModal" class="fixed inset-0 z-50 overflow-y-auto" @click="closeSubjectModal">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Backdrop -->
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

            <!-- Modal -->
            <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl" @click.stop>
              <!-- Header -->
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium leading-6 text-gray-900">
                  <i class="fas fa-plus-circle text-primary mr-2"></i>
                  Create New Subject
                </h3>
                <button @click="closeSubjectModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Form -->
              <form @submit.prevent="createSubject" class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fas fa-book mr-2 text-primary"></i> Subject Name *
                  </label>
                  <input
                    v-model="newSubject.name"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="Enter subject name"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fas fa-building mr-2 text-primary"></i> Department *
                  </label>
                  <select 
                    v-model="newSubject.departmentId" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    required
                  >
                    <option value="">Select Department</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                      {{ dept.name }}
                    </option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-code mr-2 text-primary"></i> Subject Code
                    </label>
                    <input
                      v-model="newSubject.code"
                      type="text"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="e.g., CS101"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <i class="fas fa-calendar mr-2 text-primary"></i> Semester
                    </label>
                    <select 
                      v-model="newSubject.semester" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    >
                      <option value="">Select Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 mt-6">
                  <button
                    type="button"
                    @click="closeSubjectModal"
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="subjectLoading"
                    class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                  >
                    <i v-if="subjectLoading" class="fas fa-spinner fa-spin mr-2"></i>
                    <i v-else class="fas fa-plus mr-2"></i>
                    {{ subjectLoading ? 'Creating...' : 'Create Subject' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
            <div class="flex gap-2">
              <select v-model="formData.subjectId" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                <option value="">Select Subject (Optional)</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
              <button 
                type="button" 
                @click="openSubjectModal"
                class="px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2"
                title="Create new subject"
              >
                <i class="fas fa-plus"></i>
                <span class="hidden sm:inline">New</span>
              </button>
            </div>
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
import axios from 'axios';

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

    // Subject modal state
    const showSubjectModal = ref(false);
    const subjectLoading = ref(false);
    const newSubject = ref({
      name: '',
      departmentId: '',
      code: '',
      semester: ''
    });

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

    // Subject modal functions
    const openSubjectModal = () => {
      console.log('Opening subject modal');
      console.log('Available departments:', departments.value);
      showSubjectModal.value = true;
      // Reset form
      newSubject.value = {
        name: '',
        departmentId: '',
        code: '',
        semester: ''
      };
    };

    const closeSubjectModal = () => {
      showSubjectModal.value = false;
      newSubject.value = {
        name: '',
        departmentId: '',
        code: '',
        semester: ''
      };
    };

    const createSubject = async () => {
      console.log('Creating subject with data:', newSubject.value);
      
      if (!newSubject.value.name || !newSubject.value.departmentId) {
        error.value = 'Subject name and department are required';
        return;
      }

      subjectLoading.value = true;
      error.value = '';

      try {
        console.log('Sending request to /api/subjects/public');
        const response = await axios.post('/api/subjects/public', newSubject.value);
        console.log('Subject creation response:', response.data);
        
        // Add the new subject to the store
        store.commit('notes/ADD_SUBJECT', response.data.subject);
        
        // Select the newly created subject
        formData.value.subjectId = response.data.subject.id;
        
        // Close modal
        closeSubjectModal();
        
        // Show success message
        success.value = 'Subject created successfully!';
        setTimeout(() => {
          success.value = '';
        }, 3000);
        
      } catch (err) {
        console.error('Subject creation error:', err);
        console.error('Error response:', err.response?.data);
        error.value = err.response?.data?.message || 'Failed to create subject';
      } finally {
        subjectLoading.value = false;
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
        console.error('Upload error:', err);
        error.value = err.response?.data?.message || err.message || 'Failed to upload note';
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
      handleUpload,
      // Subject modal
      showSubjectModal,
      subjectLoading,
      newSubject,
      openSubjectModal,
      closeSubjectModal,
      createSubject
    };
  }
};
</script>
