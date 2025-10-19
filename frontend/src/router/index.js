import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

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
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const user = store.getters['auth/user'];

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (to.matched.some(record => record.meta.requiresApproval)) {
      if (!user?.isApproved) {
        alert('Your account is pending approval by admin');
        next({ name: 'Home' });
      } else {
        next();
      }
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (user?.role !== 'admin') {
        alert('Access denied. Admin only.');
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

