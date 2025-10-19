import api from '../../api/axios';

const state = {
  notes: [],
  currentNote: null,
  colleges: [],
  departments: [],
  subjects: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
};

const getters = {
  notes: state => state.notes,
  currentNote: state => state.currentNote,
  colleges: state => state.colleges,
  departments: state => state.departments,
  subjects: state => state.subjects,
  loading: state => state.loading,
  error: state => state.error,
  totalPages: state => state.totalPages,
  currentPage: state => state.currentPage
};

const actions = {
  async fetchNotes({ commit }, filters = {}) {
    try {
      commit('SET_LOADING', true);
      const response = await api.get('/notes', { params: filters });
      commit('SET_NOTES', response.data.notes);
      commit('SET_PAGINATION', {
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      });
      commit('SET_LOADING', false);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch notes');
      commit('SET_LOADING', false);
    }
  },

  async fetchNote({ commit }, id) {
    try {
      commit('SET_LOADING', true);
      const response = await api.get(`/notes/${id}`);
      commit('SET_CURRENT_NOTE', response.data.note);
      commit('SET_LOADING', false);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch note');
      commit('SET_LOADING', false);
    }
  },

  async uploadNote({ commit }, formData) {
    try {
      commit('SET_LOADING', true);
      const response = await api.post('/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      commit('SET_LOADING', false);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to upload note');
      commit('SET_LOADING', false);
      throw error;
    }
  },

  async deleteNote({ commit }, id) {
    try {
      await api.delete(`/notes/${id}`);
      commit('REMOVE_NOTE', id);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to delete note');
      throw error;
    }
  },

  async addComment({ commit }, { noteId, content }) {
    try {
      const response = await api.post('/comments', { noteId, content });
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to add comment');
      throw error;
    }
  },

  async deleteComment({ commit }, id) {
    try {
      await api.delete(`/comments/${id}`);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to delete comment');
      throw error;
    }
  },

  async fetchColleges({ commit }) {
    try {
      const response = await api.get('/colleges');
      commit('SET_COLLEGES', response.data.colleges);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch colleges');
    }
  },

  async fetchDepartments({ commit }, collegeId) {
    try {
      const params = collegeId ? { collegeId } : {};
      const response = await api.get('/departments', { params });
      commit('SET_DEPARTMENTS', response.data.departments);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch departments');
    }
  },

  async fetchSubjects({ commit }, departmentId) {
    try {
      const params = departmentId ? { departmentId } : {};
      const response = await api.get('/subjects', { params });
      commit('SET_SUBJECTS', response.data.subjects);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch subjects');
    }
  }
};

const mutations = {
  SET_NOTES(state, notes) {
    state.notes = notes;
  },
  SET_CURRENT_NOTE(state, note) {
    state.currentNote = note;
  },
  SET_COLLEGES(state, colleges) {
    state.colleges = colleges;
  },
  SET_DEPARTMENTS(state, departments) {
    state.departments = departments;
  },
  SET_SUBJECTS(state, subjects) {
    state.subjects = subjects;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_PAGINATION(state, { totalPages, currentPage }) {
    state.totalPages = totalPages;
    state.currentPage = currentPage;
  },
  REMOVE_NOTE(state, id) {
    state.notes = state.notes.filter(note => note.id !== id);
  },
  ADD_SUBJECT(state, subject) {
    state.subjects.push(subject);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

