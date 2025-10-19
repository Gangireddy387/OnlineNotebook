<template>
  <div class="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <i class="fas fa-user-plus text-5xl text-primary mb-4 block"></i>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
          <p class="text-gray-600">Join our community and start sharing knowledge!</p>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-start gap-3">
          <i class="fas fa-check-circle text-xl mt-0.5"></i>
          <div>
            {{ success }}
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {{ error }}
        </div>

        <!-- Registration Form -->
        <form v-if="!success" @submit.prevent="handleRegister" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
              <input
                v-model="formData.password"
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Minimum 6 characters"
                required
                minlength="6"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">College *</label>
              <div class="flex gap-2">
                <select 
                  v-model="formData.collegeId" 
                  @change="onCollegeChange"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                >
                  <option value="">Select College</option>
                  <option v-for="college in colleges" :key="college.id" :value="college.id">
                    {{ college.name }}
                  </option>
                </select>
                <button 
                  type="button"
                  @click="showCollegeModal = true"
                  class="px-4 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                  title="Add New College"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
              <div class="flex gap-2">
                <select 
                  v-model="formData.departmentId" 
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                >
                  <option value="">Select Department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
                <button 
                  type="button"
                  @click="showDepartmentModal = true"
                  class="px-4 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
                  title="Add New Department"
                  :disabled="!formData.collegeId"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Year/Semester</label>
              <input
                v-model="formData.year"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="e.g., 3rd Year"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
              <input
                v-model="formData.rollNumber"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your roll number"
              />
            </div>
          </div>

          <button 
            type="submit" 
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <span>{{ loading ? 'Registering...' : 'Register' }}</span>
          </button>
        </form>

        <!-- Success Actions -->
        <div v-if="success" class="mt-6">
          <router-link to="/login" class="block w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg text-center transition-all">
            Go to Login
          </router-link>
        </div>

        <!-- Footer -->
        <div class="mt-6 pt-6 border-t border-gray-200 text-center">
          <p class="text-gray-600">
            Already have an account? 
            <router-link to="/login" class="text-primary font-semibold hover:underline">
              Login here
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- College Creation Modal -->
    <div v-if="showCollegeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800">
            <i class="fas fa-university mr-2 text-primary"></i>
            Add New College
          </h3>
          <button 
            @click="closeCollegeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- College Form -->
        <form @submit.prevent="handleCreateCollege" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">College Name *</label>
            <input
              v-model="collegeForm.name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter college name"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              v-model="collegeForm.location"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter college location"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
            <select 
              v-model="collegeForm.type"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              required
            >
              <option value="">Select Type</option>
              <option value="Engineering">Engineering</option>
              <option value="Degree">Degree</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <!-- Error Alert -->
          <div v-if="collegeError" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
            {{ collegeError }}
          </div>

          <!-- Success Alert -->
          <div v-if="collegeSuccess" class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3">
            {{ collegeSuccess }}
          </div>

          <!-- Modal Actions -->
          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="closeCollegeModal"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
              :disabled="collegeLoading"
            >
              <i v-if="collegeLoading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-plus mr-2"></i>
              {{ collegeLoading ? 'Creating...' : 'Create College' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Department Creation Modal -->
    <div v-if="showDepartmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800">
            <i class="fas fa-building mr-2 text-primary"></i>
            Add New Department
          </h3>
          <button 
            @click="closeDepartmentModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Department Form -->
        <form @submit.prevent="handleCreateDepartment" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">College</label>
            <div class="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
              {{ selectedCollegeName }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Department Name *</label>
            <input
              v-model="departmentForm.name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Enter department name"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Department Code</label>
            <input
              v-model="departmentForm.code"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="e.g., CSE, ECE, MECH"
              maxlength="10"
            />
          </div>

          <!-- Error Alert -->
          <div v-if="departmentError" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
            {{ departmentError }}
          </div>

          <!-- Success Alert -->
          <div v-if="departmentSuccess" class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3">
            {{ departmentSuccess }}
          </div>

          <!-- Modal Actions -->
          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="closeDepartmentModal"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
              :disabled="departmentLoading"
            >
              <i v-if="departmentLoading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-plus mr-2"></i>
              {{ departmentLoading ? 'Creating...' : 'Create Department' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  name: 'Register',
  setup() {
    const store = useStore();

    const formData = ref({
      name: '',
      email: '',
      password: '',
      phone: '',
      collegeId: '',
      departmentId: '',
      year: '',
      rollNumber: ''
    });

    const success = ref('');
    const error = ref('');

    // College modal state
    const showCollegeModal = ref(false);
    const collegeLoading = ref(false);
    const collegeError = ref('');
    const collegeSuccess = ref('');

    const collegeForm = ref({
      name: '',
      location: '',
      type: ''
    });

    // Department modal state
    const showDepartmentModal = ref(false);
    const departmentLoading = ref(false);
    const departmentError = ref('');
    const departmentSuccess = ref('');

    const departmentForm = ref({
      name: '',
      code: ''
    });

    const loading = computed(() => store.getters['auth/loading']);
    const colleges = computed(() => store.getters['notes/colleges']);
    const departments = computed(() => store.getters['notes/departments']);

    const selectedCollegeName = computed(() => {
      const college = colleges.value.find(c => c.id === formData.value.collegeId);
      return college ? college.name : 'No college selected';
    });

    const onCollegeChange = () => {
      formData.value.departmentId = '';
      if (formData.value.collegeId) {
        store.dispatch('notes/fetchDepartments', formData.value.collegeId);
      }
    };

    const closeCollegeModal = () => {
      showCollegeModal.value = false;
      collegeForm.value = {
        name: '',
        location: '',
        type: ''
      };
      collegeError.value = '';
      collegeSuccess.value = '';
    };

    const closeDepartmentModal = () => {
      showDepartmentModal.value = false;
      departmentForm.value = {
        name: '',
        code: ''
      };
      departmentError.value = '';
      departmentSuccess.value = '';
    };

    const handleCreateCollege = async () => {
      try {
        collegeLoading.value = true;
        collegeError.value = '';
        collegeSuccess.value = '';

        const response = await axios.post('/api/colleges/public', collegeForm.value);
        const newCollege = response.data.college;

        // Refresh colleges list
        await store.dispatch('notes/fetchColleges');

        // Auto-select the newly created college
        formData.value.collegeId = newCollege.id;
        onCollegeChange();

        collegeSuccess.value = 'College created successfully!';
        
        // Close modal after 1.5 seconds
        setTimeout(() => {
          closeCollegeModal();
        }, 1500);

      } catch (err) {
        collegeError.value = err.response?.data?.message || 'Failed to create college';
      } finally {
        collegeLoading.value = false;
      }
    };

    const handleCreateDepartment = async () => {
      try {
        departmentLoading.value = true;
        departmentError.value = '';
        departmentSuccess.value = '';

        const response = await axios.post('/api/departments/public', {
          ...departmentForm.value,
          collegeId: formData.value.collegeId
        });
        const newDepartment = response.data.department;

        // Refresh departments list
        await store.dispatch('notes/fetchDepartments', formData.value.collegeId);

        // Auto-select the newly created department
        formData.value.departmentId = newDepartment.id;

        departmentSuccess.value = 'Department created successfully!';
        
        // Close modal after 1.5 seconds
        setTimeout(() => {
          closeDepartmentModal();
        }, 1500);

      } catch (err) {
        departmentError.value = err.response?.data?.message || 'Failed to create department';
      } finally {
        departmentLoading.value = false;
      }
    };

    const handleRegister = async () => {
      try {
        error.value = '';
        const response = await store.dispatch('auth/register', formData.value);
        success.value = response.message;
        
        // Reset form
        formData.value = {
          name: '',
          email: '',
          password: '',
          phone: '',
          collegeId: '',
          departmentId: '',
          year: '',
          rollNumber: ''
        };
      } catch (err) {
        error.value = err.response?.data?.message || 'Registration failed';
      }
    };

    onMounted(() => {
      store.dispatch('notes/fetchColleges');
    });

    return {
      formData,
      loading,
      success,
      error,
      colleges,
      departments,
      onCollegeChange,
      handleRegister,
      // College modal
      showCollegeModal,
      collegeForm,
      collegeLoading,
      collegeError,
      collegeSuccess,
      closeCollegeModal,
      handleCreateCollege,
      // Department modal
      showDepartmentModal,
      departmentForm,
      departmentLoading,
      departmentError,
      departmentSuccess,
      closeDepartmentModal,
      handleCreateDepartment,
      selectedCollegeName
    };
  }
};
</script>
