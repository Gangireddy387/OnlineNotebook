<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          <i class="fas fa-book-open text-primary mr-3"></i>
          Browse Notes
        </h1>
        <p class="text-lg text-gray-600">Find study materials from various colleges and departments</p>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <i class="fas fa-filter text-primary"></i>
          <span>Filters</span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">College</label>
            <select v-model="filters.collegeId" @change="onCollegeChange" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
              <option value="">All Colleges</option>
              <option v-for="college in colleges" :key="college.id" :value="college.id">
                {{ college.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Department</label>
            <select v-model="filters.departmentId" @change="onDepartmentChange" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
              <option value="">All Departments</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <select v-model="filters.subjectId" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
              <option value="">All Subjects</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Search notes..."
            />
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <button @click="applyFilters" class="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i>
            <span>Apply Filters</span>
          </button>
          <button @click="resetFilters" class="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
            <i class="fas fa-redo"></i>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-xl text-primary font-semibold">Loading notes...</p>
      </div>

      <!-- Notes Grid -->
      <div v-else-if="notes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div v-for="note in notes" :key="note.id" class="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group">
          <div class="p-6">
            <!-- Note Header -->
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-gray-800 flex-1 group-hover:text-primary transition-colors line-clamp-2">
                {{ note.title }}
              </h3>
              <span class="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold uppercase rounded-full ml-2 whitespace-nowrap">
                {{ note.fileType.split('/')[1] || 'File' }}
              </span>
            </div>

            <!-- Description -->
            <p class="text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
              {{ note.description || 'No description available' }}
            </p>

            <!-- Meta Information -->
            <div class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <i class="fas fa-user text-primary"></i>
                <span class="font-medium">{{ note.User?.name }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <i class="fas fa-download text-success"></i>
                <span class="font-medium">{{ note.downloads }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <div v-if="note.College" class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-medium rounded-full">
                <i class="fas fa-university"></i>
                <span>{{ note.College.name }}</span>
              </div>
              <div v-if="note.Department" class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-xs font-medium rounded-full">
                <i class="fas fa-building"></i>
                <span>{{ note.Department.name }}</span>
              </div>
              <div v-if="note.Subject" class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-xs font-medium rounded-full">
                <i class="fas fa-book"></i>
                <span>{{ note.Subject.name }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button @click="openPreview(note)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <i class="fas fa-eye"></i>
                <span>Preview</span>
              </button>
              <router-link :to="`/notes/${note.id}`" class="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <i class="fas fa-info-circle"></i>
                <span>Details</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-20 bg-white rounded-2xl shadow-md">
        <i class="fas fa-inbox text-6xl text-gray-300 mb-5 block"></i>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">No notes found</h3>
        <p class="text-gray-600">Try adjusting your filters or check back later for new uploads.</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 mt-8">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <i class="fas fa-chevron-left"></i>
          <span>Previous</span>
        </button>
        
        <span class="text-lg font-semibold text-gray-800 bg-white px-6 py-3 rounded-lg shadow-md">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Next</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Preview Modal -->
    <PreviewModal :isOpen="showPreview" :note="selectedNote" @close="closePreview" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import PreviewModal from '../components/PreviewModal.vue';

export default {
  name: 'Notes',
  components: {
    PreviewModal
  },
  setup() {
    const store = useStore();

    const showPreview = ref(false);
    const selectedNote = ref(null);

    const filters = ref({
      collegeId: '',
      departmentId: '',
      subjectId: '',
      search: '',
      page: 1,
      limit: 12
    });

    const notes = computed(() => store.getters['notes/notes']);
    const colleges = computed(() => store.getters['notes/colleges']);
    const departments = computed(() => store.getters['notes/departments']);
    const subjects = computed(() => store.getters['notes/subjects']);
    const loading = computed(() => store.getters['notes/loading']);
    const totalPages = computed(() => store.getters['notes/totalPages']);
    const currentPage = computed(() => store.getters['notes/currentPage']);

    const applyFilters = () => {
      filters.value.page = 1;
      store.dispatch('notes/fetchNotes', filters.value);
    };

    const resetFilters = () => {
      filters.value = {
        collegeId: '',
        departmentId: '',
        subjectId: '',
        search: '',
        page: 1,
        limit: 12
      };
      applyFilters();
    };

    const onCollegeChange = () => {
      filters.value.departmentId = '';
      filters.value.subjectId = '';
      if (filters.value.collegeId) {
        store.dispatch('notes/fetchDepartments', filters.value.collegeId);
      } else {
        store.dispatch('notes/fetchDepartments');
      }
    };

    const onDepartmentChange = () => {
      filters.value.subjectId = '';
      if (filters.value.departmentId) {
        store.dispatch('notes/fetchSubjects', filters.value.departmentId);
      } else {
        store.dispatch('notes/fetchSubjects');
      }
    };

    const changePage = (page) => {
      filters.value.page = page;
      applyFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openPreview = (note) => {
      selectedNote.value = note;
      showPreview.value = true;
    };

    const closePreview = () => {
      showPreview.value = false;
      selectedNote.value = null;
    };

    onMounted(() => {
      store.dispatch('notes/fetchNotes', filters.value);
      store.dispatch('notes/fetchColleges');
      store.dispatch('notes/fetchDepartments');
      store.dispatch('notes/fetchSubjects');
    });

    return {
      filters,
      notes,
      colleges,
      departments,
      subjects,
      loading,
      totalPages,
      currentPage,
      showPreview,
      selectedNote,
      applyFilters,
      resetFilters,
      onCollegeChange,
      onDepartmentChange,
      changePage,
      openPreview,
      closePreview
    };
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
