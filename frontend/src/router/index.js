import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import { useNotification } from '../composables/useNotification';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('../views/Notes.vue')
  },
  {
    path: '/notes/:id',
    name: 'NoteDetail',
    component: () => import('../views/NoteDetail.vue')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('../views/Upload.vue'),
    meta: { requiresAuth: true, requiresApproval: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const user = store.getters['auth/user'];
  const { showToast } = useNotification();

  // If user has token but no user data, try to load it
  if (isAuthenticated && !user) {
    try {
      await store.dispatch('auth/loadUser');
    } catch (error) {
      // If loading user fails, redirect to login
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (to.matched.some(record => record.meta.requiresApproval)) {
      const currentUser = store.getters['auth/user'];
      if (!currentUser?.isApproved) {
        showToast('Account Pending', 'Your account is pending approval by admin', 'warning');
        next({ name: 'Home' });
      } else {
        next();
      }
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
      const currentUser = store.getters['auth/user'];
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin' && currentUser?.role !== 'moderator') {
        showToast('Access Denied', 'Only administrators can access this area', 'error');
        next({ name: 'Home' });
      } else {
        next();
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

