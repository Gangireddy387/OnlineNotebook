import axios from 'axios';

const state = {
  token: localStorage.getItem('token') || null,
  user: null,
  loading: false,
  error: null
};

const getters = {
  isAuthenticated: state => !!state.token,
  user: state => state.user,
  isAdmin: state => state.user?.role === 'admin' || state.user?.role === 'super_admin' || state.user?.role === 'moderator',
  isApproved: state => state.user?.isApproved || state.user?.role === 'super_admin',
  loading: state => state.loading,
  error: state => state.error
};

const actions = {
  async register({ commit }, userData) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      const response = await axios.post('/api/auth/register', userData);
      
      commit('SET_LOADING', false);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Registration failed');
      commit('SET_LOADING', false);
      throw error;
    }
  },

  async login({ commit }, credentials) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      commit('SET_LOADING', false);
      
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Login failed');
      commit('SET_LOADING', false);
      throw error;
    }
  },

  async loadUser({ commit, state }) {
    if (!state.token) return;
    
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      const response = await axios.get('/api/auth/me');
      commit('SET_USER', response.data.user);
    } catch (error) {
      commit('LOGOUT');
    }
  },

  logout({ commit }) {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    commit('LOGOUT');
  }
};

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
  },
  SET_USER(state, user) {
    state.user = user;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  LOGOUT(state) {
    state.token = null;
    state.user = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};

